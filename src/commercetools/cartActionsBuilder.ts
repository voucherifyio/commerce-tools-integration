import { TaxCategory } from '@commercetools/platform-sdk';
import {
  availablePromotion,
  CartDiscountApplyMode,
  Coupon,
  ProductToAdd,
  ValidateCouponsResult,
} from '../integration/types';
import {
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import getCartActionBuilders from './cartActions/getCartActionBuilders';
import {
  calculateTotalDiscountAmount,
  checkIfAllInapplicableCouponsArePromotionTier,
  checkIfOnlyNewCouponsFailed,
  getCouponsFromCart,
} from '../integration/helperFunctions';
import { oldGetCouponsByStatus } from './utils/oldGetCouponsByStatus';
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
  private totalDiscountAmount = 0;
  public setTotalDiscountAmount(value: number) {
    this.totalDiscountAmount = value;
  }
  private productsToAdd: ProductToAdd[];
  public setProductsToAdd(value: ProductToAdd[]) {
    this.productsToAdd = value;
  }
  private applicableCoupons: StackableRedeemableResponse[];
  public setApplicableCoupons(value: StackableRedeemableResponse[]) {
    this.applicableCoupons = value;
  }
  private inapplicableCoupons: StackableRedeemableResponse[];
  public setInapplicableCoupons(value: StackableRedeemableResponse[]) {
    this.inapplicableCoupons = value;
  }
  private skippedCoupons: StackableRedeemableResponse[];
  public setSkippedCoupons(value: StackableRedeemableResponse[]) {
    this.skippedCoupons = value;
  }
  private isValid = false;
  public setIsValid(value: boolean) {
    this.isValid = value;
  }
  private sessionKey: string;
  public setSessionKey(value: string) {
    this.sessionKey = value;
  }

  public buildActions() {
    return getCartActionBuilders()
      .flatMap((builder) =>
        builder(
          this.commerceToolsCart,
          this.gatherAllInformationsNeededToRunTheBuild(),
          this.cartDiscountApplyMode,
          this.taxCategory,
        ),
      )
      .filter((e) => e);
  }

  private gatherAllInformationsNeededToRunTheBuild() {
    const coupons: Coupon[] = getCouponsFromCart(this.commerceToolsCart);
    const uniqCoupons: Coupon[] = uniqBy(coupons, 'code');
    const valid = this.isValid;
    const totalDiscountAmount = this.totalDiscountAmount;

    const applicableCoupons = this.applicableCoupons ?? [];
    const inapplicableCoupons = this.inapplicableCoupons ?? [];
    const skippedCoupons = this.skippedCoupons ?? [];

    const sessionKey = this.sessionKey;

    return {
      availablePromotions: this.availablePromotions,
      applicableCoupons,
      notApplicableCoupons: inapplicableCoupons,
      skippedCoupons,
      newSessionKey:
        !getSession(this.commerceToolsCart) || valid ? sessionKey : null,
      valid,
      totalDiscountAmount,
      productsToAdd: this.productsToAdd ?? [],
      onlyNewCouponsFailed: this?.applicableCoupons
        ? checkIfOnlyNewCouponsFailed(
            uniqCoupons,
            applicableCoupons,
            inapplicableCoupons,
            skippedCoupons,
          )
        : undefined,
      allInapplicableCouponsArePromotionTier: this?.applicableCoupons
        ? checkIfAllInapplicableCouponsArePromotionTier(inapplicableCoupons)
        : undefined,
      couponsLimit: this.couponsLimit,
      cartDiscountApplyMode: this.cartDiscountApplyMode,
      commerceToolsCart: this.commerceToolsCart,
      taxCategory: this.taxCategory,
    };
  }
}
