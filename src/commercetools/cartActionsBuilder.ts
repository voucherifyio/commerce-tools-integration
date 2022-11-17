import { TaxCategory } from '@commercetools/platform-sdk';
import {
  availablePromotion,
  GetProductsToAddListener,
  ProductToAdd,
} from '../integration/types';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import getCartActionBuilders from './cartActions/getCartActionBuilders';
import { checkIfAllInapplicableCouponsArePromotionTier } from '../integration/utils/helperFunctions';
import { DataToRunCartActionsBuilder } from './cartActions/CartAction';
import { CartDiscountApplyMode, PriceSelector } from './types';

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
  private availablePromotions: availablePromotion[] = [];
  public setAvailablePromotions(value: availablePromotion[]) {
    this.availablePromotions = value;
  }
  private totalDiscountAmount = 0;
  public setTotalDiscountAmount(value: number) {
    this.totalDiscountAmount = value;
  }
  private productsToAdd: ProductToAdd[] = [];
  public setProductsToAdd(value: ProductToAdd[]) {
    this.productsToAdd = value;
  }
  private applicableCoupons: StackableRedeemableResponse[] = [];
  public setApplicableCoupons(value: StackableRedeemableResponse[]) {
    this.applicableCoupons = value;
  }
  private inapplicableCoupons: StackableRedeemableResponse[] = [];
  public setInapplicableCoupons(value: StackableRedeemableResponse[]) {
    this.inapplicableCoupons = value;
  }
  private sessionKey: string;
  public setSessionKey(value: string) {
    this.sessionKey = value;
  }

  private priceSelector: PriceSelector;
  public setPriceSelector(value: PriceSelector) {
    this.priceSelector = value;
  }

  public getProductsToAdd: GetProductsToAddListener;
  public setGetProductsToAddListener(handler: GetProductsToAddListener) {
    this.getProductsToAdd = handler;
  }

  public buildActions() {
    return getCartActionBuilders()
      .flatMap((builder) => builder(this.gatherDataToRunCartActionsBuilder()))
      .filter((e) => e);
  }

  private gatherDataToRunCartActionsBuilder(): DataToRunCartActionsBuilder {
    const inapplicableCoupons = this.inapplicableCoupons;
    return {
      availablePromotions: this.availablePromotions,
      applicableCoupons: this.applicableCoupons,
      inapplicableCoupons,
      newSessionKey: this.sessionKey ?? null,
      totalDiscountAmount: this.totalDiscountAmount,
      productsToAdd: this.productsToAdd ?? [],
      allInapplicableCouponsArePromotionTier:
        this.applicableCoupons.length || inapplicableCoupons.length
          ? checkIfAllInapplicableCouponsArePromotionTier(inapplicableCoupons)
          : undefined,
      couponsLimit: this.couponsLimit,
      cartDiscountApplyMode: this.cartDiscountApplyMode,
      commerceToolsCart: this.commerceToolsCart,
      taxCategory: this.taxCategory,
    };
  }
}
