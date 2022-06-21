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

type CartActionAddLineItem = {
  action: 'addLineItem';
  sku: string;
  quantity: number;
  externalTotalPrice?: {
    price: {
      centAmount: number;
      currencyCode: string;
    };
    totalPrice: {
      centAmount: number;
      currencyCode: string;
    };
  };
};

type CartActionRemoveLineItem = {
  action: 'removeLineItem';
  lineItemId: string;
  quantity: number;
};

type CartAction =
  | CartActionSetCustomType
  | CartActionSetCustomFieldWithCoupons
  | CartActionSetCustomFieldWithSession
  | CartActionRemoveCustomLineItem
  | CartActionAddCustomLineItem
  | CartActionAddLineItem
  | CartActionRemoveLineItem;

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

  private couponCustomLineNamePrefix = 'Voucher, ';

  private async setCustomTypeForInitializedCart() {
    const couponType = await this.typesService.findCouponType('couponCodes');
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

  private checkForUnitTypeDiscounts(response) {
    const productsToAdd = [];
    response.redeemables
      ?.filter((code) => code.result?.discount?.type === 'UNIT')
      .forEach((unitTypeCode) => {
        if (unitTypeCode.result?.discount?.effect === 'ADD_NEW_ITEMS') {
          const freeItem = unitTypeCode.order?.items?.find(
            (item) =>
              item.product?.source_id ===
              unitTypeCode.result?.discount?.product?.source_id,
          );

          productsToAdd.push({
            code: unitTypeCode.id,
            effect: unitTypeCode.result?.discount?.effect,
            quantity: unitTypeCode.result?.discount?.unit_off,
            product: unitTypeCode.result?.discount.sku.source_id,
            initial_quantity: freeItem?.initial_quantity,
            applied_discount_amount: freeItem?.applied_discount_amount,
          });
        }

        if (unitTypeCode.result?.discount?.effect === 'ADD_MISSING_ITEMS') {
          const freeItem = unitTypeCode.order?.items?.find(
            (item) =>
              item.product?.source_id ===
              unitTypeCode.result?.discount?.product?.source_id,
          );

          productsToAdd.push({
            code: unitTypeCode.id,
            effect: unitTypeCode.result?.discount?.effect,
            discount_quantity: freeItem.discount_quantity,
            initial_quantity: freeItem.initial_quantity,
            product: unitTypeCode.result?.discount.sku.source_id,
          });
        }

        if (unitTypeCode.result?.discount?.effect === 'ADD_MANY_ITEMS') {
          unitTypeCode.result.discount.units.forEach((product) => {
            if (product.effect === 'ADD_NEW_ITEMS') {
              const freeItem = unitTypeCode.order?.items?.find(
                (item) => item.product.source_id === product.product.source_id,
              );

              productsToAdd.push({
                code: unitTypeCode.id,
                effect: product.effect,
                quantity: product.unit_off,
                product: product.sku.source_id,
                initial_quantity: freeItem.initial_quantity,
                applied_discount_amount: freeItem.applied_discount_amount,
              });
            }

            if (product.effect === 'ADD_MISSING_ITEMS') {
              const freeItem = unitTypeCode.order?.items?.find(
                (item) => item.product.source_id === product.product.source_id,
              );

              productsToAdd.push({
                code: unitTypeCode.id,
                effect: product.effect,
                discount_quantity: freeItem.discount_quantity,
                initial_quantity: freeItem.initial_quantity,
                product: product.sku.source_id,
              });
            }
          });
        }
      });
    return productsToAdd;
  }

  private async validateCoupons(cartObj: Cart, sessionKey?: string | null) {
    const { id, customerId } = cartObj;
    const coupons: Coupon[] = (cartObj.custom?.fields?.discount_codes ?? [])
      .map(desarializeCoupons)
      .filter((coupon) => coupon.status !== 'NOT_APPLIED'); // we already declined them, will be removed by frontend

    if (!coupons.length) {
      return {
        applicableCoupons: [],
        notApplicableCoupons: [],
        skippedCoupons: [],
        productsToAdd: [],
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
    const totalDiscountAmount = validatedCoupons.order?.total_discount_amount;

    const productsToAdd = this.checkForUnitTypeDiscounts(validatedCoupons);

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
      totalDiscountAmount,
      productsToAdd,
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
      totalDiscountAmount,
      productsToAdd,
    };
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
      .filter((lineItem) =>
        lineItem.name.en.startsWith(this.couponCustomLineNamePrefix),
      )
      .map(
        (lineItem) =>
          ({
            action: 'removeCustomLineItem',
            customLineItemId: lineItem.id,
          } as CartActionRemoveCustomLineItem),
      );
  }

  private addCustomLineItemWithDiscounts(
    cartObj: Cart,
    total_discount_amount: number,
    applicableCoupons,
    taxCategory,
  ): CartActionAddCustomLineItem[] {
    const currencyCode = cartObj.totalPrice.currencyCode;
    const discountLines: CartActionAddCustomLineItem[] = [];
    const couponCodes = applicableCoupons.map((coupon) => coupon.id).join(', ');

    discountLines.push({
      action: 'addCustomLineItem',
      name: {
        en: `${this.couponCustomLineNamePrefix}coupon value => ${Math.round(
          total_discount_amount / 100,
        )}`,
      },
      quantity: 1,
      money: {
        centAmount: -total_discount_amount,
        type: 'centPrecision',
        currencyCode,
      },
      slug: couponCodes,
      taxCategory: {
        id: taxCategory.id,
      },
    });

    return discountLines;
  }

  private addFreeLineItems(cartObj: Cart, productsToAdd): CartAction[] {
    const lineItems: CartAction[] = [];

    lineItems.push(
      ...productsToAdd
        .filter((product) => product.effect === 'ADD_NEW_ITEMS')
        .filter((product) => {
          return !cartObj.lineItems.find((item) =>
            item.custom?.fields.applied_codes.map(
              (applied) => JSON.parse(applied).code === product.code,
            ),
          );
        })
        .map((product) => {
          return {
            action: 'addLineItem',
            sku: product.product,
            quantity: product.quantity,
            custom: {
              typeKey: 'lineItemCodesType',
              fields: {
                applied_codes: [
                  JSON.stringify({
                    code: product.code,
                    type: 'UNIT',
                    effect: product.effect,
                    quantity: product.quantity,
                  }),
                ],
              },
            },
          };
        }),
    );

    lineItems.push(
      ...productsToAdd
        .filter((product) => product.effect === 'ADD_MISSING_ITEMS')
        .filter(
          (product) => product.discount_quantity > product.initial_quantity,
        )
        .map((product) => {
          return {
            action: 'addLineItem',
            sku: product.product,
            quantity: product.discount_quantity - product.initial_quantity,
            custom: {
              typeKey: 'lineItemCodesType',
              fields: {
                applied_codes: [
                  JSON.stringify({
                    code: product.code,
                    type: 'UNIT',
                    effect: product.effect,
                    quantity: product.quantity,
                  }),
                ],
              },
            },
          };
        }),
    );

    return lineItems;
  }

  private removeFreeLineItemsIfCouponNoLongerIsApplied(
    cartObj: Cart,
    unitCodes,
  ): CartAction[] {
    return cartObj.lineItems
      .filter((item) => item.custom?.fields?.applied_codes)
      .filter((item) => {
        const isCouponWhichNoLongerExist = item.custom?.fields?.applied_codes
          .map((code) => JSON.parse(code))
          .filter((code) => code.type === 'UNIT')
          .find((code) =>
            unitCodes.map((unitCode) => unitCode.code).includes(code.code),
          );

        return !isCouponWhichNoLongerExist;
      })
      .map((item) => {
        const quantityFromCode = item.custom?.fields.applied_codes
          .map((code) => JSON.parse(code))
          .filter((code) => code.type === 'UNIT')
          .find(
            (code) =>
              !unitCodes.map((unitCode) => unitCode.code).includes(code.code),
          ).quantity;

        return {
          action: 'removeLineItem',
          lineItemId: item.id,
          quantity: quantityFromCode,
        };
      });
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
      totalDiscountAmount,
      productsToAdd,
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
        ...(await this.addCustomLineItemWithDiscounts(
          cartObj,
          totalDiscountAmount,
          applicableCoupons,
          taxCategory,
        )),
      );
    }

    actions.push(...this.addFreeLineItems(cartObj, productsToAdd));
    actions.push(
      ...this.removeFreeLineItemsIfCouponNoLongerIsApplied(
        cartObj,
        productsToAdd,
      ),
    );

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
