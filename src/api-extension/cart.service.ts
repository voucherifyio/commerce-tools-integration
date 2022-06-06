import { Injectable } from '@nestjs/common';
import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../commerceTools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { Cart } from '@commercetools/platform-sdk';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import { desarializeCoupons, Coupon } from './coupon';
type CartActionSetCustomType = {
  action: 'setCustomType';
  name: 'couponCodes';
  type: {
    id: string;
  };
};

type CartActionSetCustomFieldWithCoupons = {
  action: 'setCustomField';
  name: 'discount_codes';
  value: string[];
};

type CartActionSetCustomFieldWithSession = {
  action: 'setCustomField';
  name: 'session';
  value: string;
};

type CartActionRemoveCustomLineItem = {
  action: 'removeCustomLineItem';
  customLineItemId: string;
};

type CartActionAddCustomLineItem = {
  action: 'addCustomLineItem';
  name: {
    en: string;
  };
  quantity: number;
  money: {
    centAmount: number;
    currencyCode: string;
    type: 'centPrecision';
  };
  slug: string;
  taxCategory: {
    id: string;
  };
};

type CartAction =
  | CartActionSetCustomType
  | CartActionSetCustomFieldWithCoupons
  | CartActionSetCustomFieldWithSession
  | CartActionRemoveCustomLineItem
  | CartActionAddCustomLineItem;

type CartResponse = { status: boolean; actions: CartAction[] };

@Injectable()
export class CartService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
  ) {}
  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    CartService.name,
  );

  private async setCustomTypeForInitializedCart() {
    const couponType = await this.typesService.findCouponType();
    if (!couponType) {
      const msg = 'CouponType not found';
      this.logger.error({
        msg,
      });
      throw new Error(msg);
    }
    return {
      status: true,
      actions: [
        {
          action: 'setCustomType',
          type: {
            id: couponType.id,
          },
          name: 'couponCodes',
        } as CartActionSetCustomType,
      ] as [CartActionSetCustomType],
    };
  }

  private async validateCoupons(cartObj: Cart, sessionKey?: string | null) {
    const { id, customerId } = cartObj;
    const coupons: Coupon[] = (
      cartObj.custom?.fields?.discount_codes ?? []
    ).map(desarializeCoupons);
    if (!coupons.length) {
      return {
        applicableCoupons: [],
        notApplicableCoupons: [],
        skippedCoupons: [],
      };
    }
    this.logger.info({
      msg: 'Attempt to apply coupons',
      coupons,
      id,
      customerId,
    });

    const validatedCoupons =
      await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
        coupons.map((coupon) => coupon.code),
        cartObj,
        sessionKey,
      );

    const notApplicableCoupons = validatedCoupons.redeemables.filter(
      (voucher) => voucher.status === 'INAPPLICABLE',
    );
    const skippedCoupons = validatedCoupons.redeemables.filter(
      (voucher) => voucher.status === 'SKIPPED',
    );
    const applicableCoupons = validatedCoupons.redeemables.filter(
      (voucher) => voucher.status === 'APPLICABLE',
    );

    const sessionKeyResponse = validatedCoupons.session?.key;
    const valid = validatedCoupons.valid;

    this.logger.info({
      msg: 'Validated coupons',
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      id,
      valid,
      customerId,
      sessionKey,
      sessionKeyResponse,
    });

    return {
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      newSessionKey:
        sessionKey && !validatedCoupons.valid
          ? null
          : validatedCoupons.session?.key,
      valid,
    };
  }

  private async calculateDiscount(
    applicableCoupons: StackableRedeemableResponse[],
    cartObj: Cart,
  ) {
    const { amountOff, percentageOff } = applicableCoupons.reduce(
      (acc, redeemable) => {
        return {
          percentageOff:
            redeemable.result.discount.type === 'PERCENT'
              ? acc.percentageOff + redeemable.result.discount.percent_off
              : acc.percentageOff,
          amountOff:
            redeemable.result.discount.type === 'AMOUNT'
              ? acc.amountOff + redeemable.result.discount.amount_off
              : acc.amountOff,
        };
      },
      {
        percentageOff: 0,
        amountOff: 0,
      },
    );
    const percentageDiscountValue = Math.round(
      this.getTotalPriceWithoutaDiscount(cartObj) * (percentageOff / 100),
    );

    return { amountOff, percentageOff, percentageDiscountValue };
  }

  private async checkCouponTaxCategoryWithCountires(cartCountry?: string) {
    const taxCategory = await this.taxCategoriesService.getCouponTaxCategory();
    if (!taxCategory) {
      const msg = 'Coupon tax category was not configured correctly';
      this.logger.error({
        msg,
      });
      throw new Error(msg);
    }
    if (
      cartCountry &&
      !taxCategory?.rates?.find((rate) => rate.country === cartCountry)
    ) {
      await this.taxCategoriesService.addCountryToCouponTaxCategory(
        taxCategory,
        cartCountry,
      );
    }
    return taxCategory;
  }

  private async removeOldCustomLineItemsWithDiscounts(cartObj: Cart) {
    // We recognize discount line items by name... wold be great to find more reliable way
    return (cartObj.customLineItems || [])
      .filter((lineItem) => lineItem.name.en.startsWith('Coupon '))
      .map(
        (lineItem) =>
          ({
            action: 'removeCustomLineItem',
            customLineItemId: lineItem.id,
          } as CartActionRemoveCustomLineItem),
      );
  }

  private getTotalPriceWithoutaDiscount(cartObj: Cart) {
    return cartObj.lineItems.reduce((acc, lineItem) => {
      const lineItemPrice = lineItem.totalPrice.centAmount || 0;
      return acc + lineItemPrice;
    }, 0);
  }

  private async addCustomLineItemsThatReflectDiscounts(
    applicableCoupons: StackableRedeemableResponse[],
    cartObj: Cart,
    taxCategory,
  ): Promise<CartActionAddCustomLineItem[]> {
    const currencyCode = cartObj.totalPrice.currencyCode;
    const { amountOff, percentageOff, percentageDiscountValue } =
      await this.calculateDiscount(applicableCoupons, cartObj);
    const discountLines: CartActionAddCustomLineItem[] = [];
    if (amountOff) {
      const amountCouponsCodes = applicableCoupons
        .filter((coupon) => coupon.result.discount.type === 'AMOUNT')
        .map((coupon) => coupon.id)
        .join(', ');

      discountLines.push({
        action: 'addCustomLineItem',
        name: {
          en: `Coupon ${amountOff / 100} ${currencyCode}`,
        },
        quantity: 1,
        money: {
          centAmount: -amountOff,
          type: 'centPrecision',
          currencyCode,
        },
        slug: amountCouponsCodes,
        taxCategory: {
          id: taxCategory.id,
        },
      });
    }
    if (percentageOff) {
      const percentageCouponsCodes = applicableCoupons
        .filter((coupon) => coupon.result.discount.type === 'PERCENT')
        .map((coupon) => coupon.id)
        .join(', ');

      discountLines.push({
        action: 'addCustomLineItem',
        name: {
          en: `Coupon ${percentageOff}% => ${
            percentageDiscountValue / 100
          } ${currencyCode}`,
        },
        quantity: 1,
        money: {
          centAmount: -percentageDiscountValue,
          type: 'centPrecision',
          currencyCode,
        },
        slug: percentageCouponsCodes,
        taxCategory: {
          id: taxCategory.id,
        },
      });
    }
    return discountLines;
  }

  private updateDiscountsCodes(
    applicableCoupons: StackableRedeemableResponse[],
    notApplicableCoupons: StackableRedeemableResponse[],
    skippedCoupons: StackableRedeemableResponse[],
  ): CartActionSetCustomFieldWithCoupons {
    const coupons = [
      ...[...applicableCoupons, ...skippedCoupons].map(
        (coupon) =>
          ({
            code: coupon.id,
            status: 'APPLIED',
          } as Coupon),
      ),
      ...notApplicableCoupons.map(
        (coupon) =>
          ({
            code: coupon.id,
            status: 'NOT_APPLIED',
            errMsg: coupon.result?.error?.details,
          } as Coupon),
      ),
    ];
    return {
      action: 'setCustomField',
      name: 'discount_codes',
      value: coupons.map((coupon) => JSON.stringify(coupon)) as string[],
    };
  }

  private getSession(cartObj: Cart): string | null {
    return cartObj.custom?.fields?.session
      ? cartObj.custom?.fields?.session
      : null;
  }

  private setSession(sessionKey: string): CartActionSetCustomFieldWithSession {
    return {
      action: 'setCustomField',
      name: 'session',
      value: sessionKey,
    };
  }

  async checkCartAndMutate(cartObj: Cart): Promise<CartResponse> {
    if (cartObj.version === 1) {
      return await this.setCustomTypeForInitializedCart();
    }

    const taxCategory = await this.checkCouponTaxCategoryWithCountires(
      cartObj?.country,
    );

    const sessionKey = this.getSession(cartObj);

    const {
      valid,
      applicableCoupons,
      skippedCoupons,
      notApplicableCoupons,
      newSessionKey,
    } = await this.validateCoupons(cartObj, sessionKey);

    const actions: CartAction[] = [];

    if (newSessionKey && valid && newSessionKey !== sessionKey) {
      actions.push(this.setSession(newSessionKey));
    }

    if (valid) {
      actions.push(
        ...(await this.removeOldCustomLineItemsWithDiscounts(cartObj)),
      );
      actions.push(
        ...(await this.addCustomLineItemsThatReflectDiscounts(
          applicableCoupons,
          cartObj,
          taxCategory,
        )),
      );
    }

    const calculatedDiscountBaseOnCodes = cartObj.customLineItems
      .filter((lineItem) => lineItem.name.en.startsWith('Coupon '))
      .reduce((acc, lineItem) => {
        return [...acc, ...lineItem?.slug?.split(', ')];
      }, [] as string[]);

    if (
      !valid &&
      skippedCoupons.length &&
      calculatedDiscountBaseOnCodes.length !== skippedCoupons.length
    ) {
      this.logger.warn({
        msg: 'Validation invalid, some previous discounts  are invalid now. Remove discount from the cart as calculations will be different.',
        calculatedDiscountBaseOnCodes,
        skippedCoupons,
        notApplicableCoupons,
        applicableCoupons,
      });
      actions.push(
        ...(await this.removeOldCustomLineItemsWithDiscounts(cartObj)),
      );
    }

    actions.push(
      this.updateDiscountsCodes(
        applicableCoupons,
        notApplicableCoupons,
        skippedCoupons,
      ),
    );

    this.logger.info(actions);
    return { status: true, actions };
  }
}
