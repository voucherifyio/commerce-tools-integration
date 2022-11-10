import { TaxCategory } from '@commercetools/platform-sdk';
import {
  availablePromotion,
  CartDiscountApplyMode,
  Coupon,
  ProductToAdd,
  ValidateCouponsResult,
} from '../integration/types';
import { ValidationValidateStackableResponse } from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import getCartActionBuilders from './cartActions/getCartActionBuilders';
import {
  calculateTotalDiscountAmount,
  checkIfAllInapplicableCouponsArePromotionTier,
  checkIfOnlyNewCouponsFailed,
  getCouponsFromCart,
} from '../integration/helperFunctions';
import { getCouponsByStatus } from './utils/getCouponsByStatus';
import { uniqBy } from 'lodash';
import { getSession } from './commercetools.service';

export class ActionBuilder {
  private taxCategory: TaxCategory;
  public setTaxCategory(value: TaxCategory) {
    this.taxCategory = value;
  }
  private couponsLimit: number;
  public setCouponsLimit(value: number) {
    this.couponsLimit = value;
  }
  private commerceToolsCart: CommerceToolsCart;
  public setCart(value: CommerceToolsCart) {
    this.commerceToolsCart = value;
  }
  private cartDiscountApplyMode: CartDiscountApplyMode;
  public setCartDiscountApplyMode(value: CartDiscountApplyMode) {
    this.cartDiscountApplyMode = value;
  }
  private availablePromotions: availablePromotion[];
  public setAvailablePromotions(value: availablePromotion[]) {
    this.availablePromotions = value;
  }
  private validateCouponsResult: ValidationValidateStackableResponse;
  public setValidateCouponsResult(value: ValidationValidateStackableResponse) {
    this.validateCouponsResult = value;
  }
  private productsToAdd: ProductToAdd[];
  public setProductsToAdd(value: ProductToAdd[]) {
    this.productsToAdd = value;
  }

  public buildActions() {
    return getCartActionBuilders()
      .flatMap((builder) =>
        builder(
          this.commerceToolsCart,
          this.extendValidateCouponsResultForCartActionBuilder(
            {
              validatedCoupons: this.validateCouponsResult,
              availablePromotions: this.availablePromotions,
              productsToAdd: this.productsToAdd,
            },
            this.commerceToolsCart,
          ),
          this.cartDiscountApplyMode,
          this.taxCategory,
        ),
      )
      .filter((e) => e);
  }

  private extendValidateCouponsResultForCartActionBuilder(
    validateCouponsResult: ValidateCouponsResult,
    cart: CommerceToolsCart,
  ) {
    const coupons: Coupon[] = getCouponsFromCart(cart);
    const uniqCoupons: Coupon[] = uniqBy(coupons, 'code');
    const validatedCoupons = validateCouponsResult?.validatedCoupons;
    const { valid } = validatedCoupons ?? { valid: false };
    const totalDiscountAmount = validatedCoupons
      ? calculateTotalDiscountAmount(validatedCoupons)
      : 0;

    const notApplicableCoupons = getCouponsByStatus(
      validatedCoupons,
      'INAPPLICABLE',
    );
    const skippedCoupons = getCouponsByStatus(validatedCoupons, 'SKIPPED');
    const applicableCoupons = getCouponsByStatus(
      validatedCoupons,
      'APPLICABLE',
    );

    const sessionKeyResponse = validatedCoupons?.session?.key;

    return {
      availablePromotions: validateCouponsResult.availablePromotions,
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      newSessionKey: !getSession(cart) || valid ? sessionKeyResponse : null,
      valid,
      totalDiscountAmount,
      productsToAdd: validateCouponsResult.productsToAdd ?? [],
      onlyNewCouponsFailed: validateCouponsResult?.validatedCoupons
        ? checkIfOnlyNewCouponsFailed(
            uniqCoupons,
            applicableCoupons,
            notApplicableCoupons,
            skippedCoupons,
          )
        : undefined,
      allInapplicableCouponsArePromotionTier:
        validateCouponsResult?.validatedCoupons
          ? checkIfAllInapplicableCouponsArePromotionTier(notApplicableCoupons)
          : undefined,
      couponsLimit: this.couponsLimit,
    };
  }
}
