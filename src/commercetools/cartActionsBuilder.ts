import { TaxCategory } from '@commercetools/platform-sdk';
import {
  availablePromotion,
  CartDiscountApplyMode,
  ProductToAdd,
} from '../integration/types';
import { ValidationValidateStackableResponse } from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';

export class CartActionsBuilder {
  private taxCategory: TaxCategory;
  public setTaxCategory(value: TaxCategory) {
    this.taxCategory = value;
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
  private validatedCoupons: ValidationValidateStackableResponse;
  public setValidatedCoupons(value: ValidationValidateStackableResponse) {
    this.validatedCoupons = value;
  }
  private productsToAdd: ProductToAdd[];
  public setProductsToAdd(value: ProductToAdd[]) {
    this.productsToAdd = value;
  }
}
