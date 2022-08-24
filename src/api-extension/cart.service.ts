import { Cart } from '@commercetools/platform-sdk';
import { Injectable, Logger } from '@nestjs/common';
import {
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';

import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../commerceTools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import getCartActionBuilders from './cartActions/getCartActionBuilders';
import convertUnitTypeCouponsToFreeProducts from './convertUnitTypeCouponsToFreeProducts';
import { desarializeCoupons, Coupon, CouponStatus } from './coupon';
import {
  CartResponse,
  PriceSelector,
  ProductToAdd,
  ValidateCouponsResult,
} from './types';
import { CommerceToolsConnectorService } from '../commerceTools/commerce-tools-connector.service';
import { OrdersCreateResponse } from '@voucherify/sdk/dist/types/Orders';
import { ProductMapper } from './mappers/product';

function getSession(cart: Cart): string | null {
  return cart.custom?.fields?.session ?? null;
}

function getCouponsFromCart(cart: Cart): Coupon[] {
  return (cart.custom?.fields?.discount_codes ?? [])
    .map(desarializeCoupons)
    .filter(
      (coupon) =>
        coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
    ); // we already declined them, will be removed by frontend
}

function checkCouponsValidatedAsState(
  coupons: Coupon[],
  validatedCoupons: StackableRedeemableResponse[],
  status: CouponStatus,
): boolean {
  return (
    validatedCoupons.length === 0 ||
    coupons
      .filter((coupon) => coupon.status === status)
      .every((coupon) =>
        validatedCoupons.find((element) => element.id === coupon.code),
      )
  );
}

function checkIfOnlyNewCouponsFailed(
  coupons: Coupon[],
  applicableCoupons: StackableRedeemableResponse[],
  notApplicableCoupons: StackableRedeemableResponse[],
  skippedCoupons: StackableRedeemableResponse[],
): boolean {
  const areAllNewCouponsNotApplicable = checkCouponsValidatedAsState(
    coupons,
    notApplicableCoupons,
    'NEW',
  );

  const areAllAppliedCouponsApplicable = checkCouponsValidatedAsState(
    coupons,
    applicableCoupons,
    'APPLIED',
  );

  const areAllAppliedCouponsSkipped = checkCouponsValidatedAsState(
    coupons,
    skippedCoupons,
    'APPLIED',
  );

  return (
    notApplicableCoupons.length !== 0 &&
    areAllNewCouponsNotApplicable &&
    areAllAppliedCouponsSkipped &&
    areAllAppliedCouponsApplicable
  );
}

@Injectable()
export class CartService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
    private readonly logger: Logger,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly productMapper: ProductMapper,
  ) {}

  private async validateCoupons(
    cart: Cart,
    sessionKey?: string | null,
  ): Promise<ValidateCouponsResult> {
    const { id, customerId, anonymousId } = cart;
    const coupons: Coupon[] = getCouponsFromCart(cart);
    const taxCategory = await this.checkCouponTaxCategoryWithCountries(cart);

    const promotions =
      await this.voucherifyConnectorService.getAvailablePromotions(
        cart,
        this.productMapper.mapLineItems(cart.lineItems),
      );

    const availablePromotions = promotions
      .filter((promo) => {
        if (!coupons.length) {
          return true;
        }

        const codes = coupons
          .filter((coupon) => coupon.status !== 'DELETED')
          .map((coupon) => coupon.code);
        return !codes.includes(promo.id);
      })
      .map((promo) => {
        return {
          status: 'AVAILABLE',
          value: promo.discount_amount,
          banner: promo.banner,
          code: promo.id,
          type: promo.object,
        };
      });

    if (!coupons.length) {
      this.logger.debug({
        msg: 'No coupons applied, skipping voucherify call',
      });

      return {
        valid: false,
        availablePromotions: availablePromotions,
        applicableCoupons: [],
        notApplicableCoupons: [],
        skippedCoupons: [],
        productsToAdd: [],
        totalDiscountAmount: 0,
      };
    }
    this.logger.debug({
      msg: 'Attempt to apply coupons',
      coupons,
      id,
      customerId,
      anonymousId,
    });

    const deletedCoupons = coupons.filter(
      (coupon) => coupon.status === 'DELETED',
    );

    deletedCoupons
      .filter((coupon) => coupon.type !== 'promotion_tier')
      .map((coupon) =>
        this.voucherifyConnectorService.releaseValidationSession(
          coupon.code,
          sessionKey,
        ),
      );

    if (deletedCoupons.length === coupons.length) {
      return {
        valid: false,
        availablePromotions: availablePromotions,
        applicableCoupons: [],
        notApplicableCoupons: [],
        skippedCoupons: [],
        productsToAdd: [],
        totalDiscountAmount: 0,
      };
    }

    const validatedCoupons =
      await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
        coupons.filter((coupon) => coupon.status != 'DELETED'),
        cart,
        this.productMapper.mapLineItems(cart.lineItems),
        sessionKey,
      );

    const getCouponsByStatus = (status: StackableRedeemableResponseStatus) =>
      validatedCoupons.redeemables.filter(
        (redeemable) => redeemable.status === status,
      );
    const notApplicableCoupons = getCouponsByStatus('INAPPLICABLE');
    const skippedCoupons = getCouponsByStatus('SKIPPED');
    const applicableCoupons = getCouponsByStatus('APPLICABLE');

    const productsToAdd = await convertUnitTypeCouponsToFreeProducts(
      validatedCoupons,
      this.commerceToolsConnectorService.getClient(),
      this.getPriceSelectorFromCart(cart),
    );

    this.handleCartDiscountDifferences(
      productsToAdd,
      validatedCoupons,
      applicableCoupons,
    );

    const sessionKeyResponse = validatedCoupons.session?.key;
    const { valid } = validatedCoupons;
    const totalDiscountAmount =
      validatedCoupons.order?.total_discount_amount ?? 0;

    const onlyNewCouponsFailed = checkIfOnlyNewCouponsFailed(
      coupons,
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
    );

    this.logger.debug({
      msg: 'Validated coupons',
      availablePromotions,
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
      onlyNewCouponsFailed,
      taxCategory,
    });
    const newSessionKey = !sessionKey || valid ? sessionKeyResponse : null;

    return {
      availablePromotions,
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      newSessionKey,
      valid,
      totalDiscountAmount,
      productsToAdd,
      onlyNewCouponsFailed,
      taxCategory,
    };
  }

  private async checkCouponTaxCategoryWithCountries(cart: Cart) {
    const { country } = cart;
    const taxCategory = await this.taxCategoriesService.getCouponTaxCategory();
    if (!taxCategory) {
      const msg = 'Coupon tax category was not configured correctly';
      this.logger.error({ msg });
      throw new Error(msg);
    }

    if (
      country &&
      !taxCategory?.rates?.find((rate) => rate.country === country)
    ) {
      await this.taxCategoriesService.addCountryToCouponTaxCategory(
        taxCategory,
        country,
      );
    }

    return taxCategory;
  }

  private async setCustomTypeForInitializedCart(): Promise<CartResponse> {
    const couponType = await this.typesService.findCouponType('couponCodes');
    if (!couponType) {
      const msg = 'CouponType not found';
      this.logger.error({ msg });
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
        },
      ],
    };
  }

  async checkCartAndMutate(cart: Cart): Promise<CartResponse> {
    if (cart.version === 1) {
      return this.setCustomTypeForInitializedCart();
    }
    const sessionKey = getSession(cart);
    const validateCouponsResult = await this.validateCoupons(cart, sessionKey);

    const actions = getCartActionBuilders(validateCouponsResult).flatMap(
      (builder) => builder(cart, validateCouponsResult),
    );

    this.logger.debug(actions);
    return {
      status: true,
      actions,
    };
  }

  private getPriceSelectorFromCart(cart: Cart): PriceSelector {
    return {
      country: cart.country,
      currencyCode: cart.totalPrice.currencyCode,
      customerGroup: cart.customerGroup,
      distributionChannels: [
        ...new Set(
          cart.lineItems
            .map((item) => item.distributionChannel)
            .filter((item) => item != undefined),
        ),
      ],
    };
  }

  private countOrderDiscountDifference(
    order: OrdersCreateResponse,
    discountDifference: number,
  ) {
    order.items_discount_amount -= discountDifference;
    order.total_discount_amount -= discountDifference;
    order.total_applied_discount_amount -= discountDifference;
    order.items_applied_discount_amount -= discountDifference;
  }

  private handleCartDiscountDifferences(
    productsToAdd: ProductToAdd[],
    validatedCoupons: ValidationValidateStackableResponse,
    applicableCoupons: StackableRedeemableResponse[],
  ) {
    productsToAdd.map((productToAdd) => {
      this.countOrderDiscountDifference(
        validatedCoupons.order,
        productToAdd.discount_difference,
      );
    });

    productsToAdd.map((productToAdd) => {
      applicableCoupons
        .filter((redeem) => redeem.id === productToAdd.code)
        .map((redeem) => {
          this.countOrderDiscountDifference(
            redeem.order,
            productToAdd.discount_difference,
          );
        });
    });
  }
}
