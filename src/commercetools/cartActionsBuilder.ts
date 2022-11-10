import { TaxCategory } from '@commercetools/platform-sdk';
import {
  availablePromotion,
  CartDiscountApplyMode,
  Coupon,
  ProductToAdd,
} from '../integration/types';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import getCartActionBuilders from './cartActions/getCartActionBuilders';
import {
  checkIfAllInapplicableCouponsArePromotionTier,
  checkIfOnlyNewCouponsFailed,
  getCouponsFromCartOrOrder,
} from '../integration/helperFunctions';
import { uniqBy } from 'lodash';
import { getSession } from './commercetools.service';
import { DataToRunCartActionsBuilder } from './cartActions/CartAction';

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
      .flatMap((builder) => builder(this.gatherDataToRunCartActionsBuilder()))
      .filter((e) => e);
  }

  private gatherDataToRunCartActionsBuilder(): DataToRunCartActionsBuilder {
    const coupons: Coupon[] = getCouponsFromCartOrOrder(this.commerceToolsCart);
    const uniqCoupons: Coupon[] = uniqBy(coupons, 'code');
    const applicableCoupons = this.applicableCoupons ?? [];
    const inapplicableCoupons = this.inapplicableCoupons ?? [];
    const skippedCoupons = this.skippedCoupons ?? [];
    return {
      availablePromotions: this.availablePromotions,
      applicableCoupons,
      inapplicableCoupons,
      skippedCoupons,
      newSessionKey:
        !getSession(this.commerceToolsCart) || this.isValid
          ? this.sessionKey
          : null,
      valid: this.isValid,
      totalDiscountAmount: this.totalDiscountAmount,
      productsToAdd: this.productsToAdd ?? [],
      onlyNewCouponsFailed:
        this?.applicableCoupons ||
        this?.inapplicableCoupons ||
        this?.skippedCoupons
          ? checkIfOnlyNewCouponsFailed(
              uniqCoupons,
              applicableCoupons,
              inapplicableCoupons,
              skippedCoupons,
            )
          : undefined,
      allInapplicableCouponsArePromotionTier:
        this?.applicableCoupons ||
        this?.inapplicableCoupons ||
        this?.skippedCoupons
          ? checkIfAllInapplicableCouponsArePromotionTier(inapplicableCoupons)
          : undefined,
      couponsLimit: this.couponsLimit,
      cartDiscountApplyMode: this.cartDiscountApplyMode,
      commerceToolsCart: this.commerceToolsCart,
      taxCategory: this.taxCategory,
    };
  }
}
