import { Product, TaxCategory } from '@commercetools/platform-sdk';
import {
  availablePromotion,
  CartUpdateActionsInterface,
  ProductToAdd,
} from '../../integration/types';
import {
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResultDiscountUnit,
} from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import getCartActionBuilders from './cart-update-actions/getCartActionBuilders';
import { checkIfAllInapplicableCouponsArePromotionTier } from '../../integration/utils/helperFunctions';
import { DataToRunCartActionsBuilder } from './cart-update-actions/CartAction';
import {
  CartDiscountApplyMode,
  PriceSelector,
  ProductWithCurrentPriceAmountInterface,
} from '../types';
import { getCommercetoolstCurrentPriceAmount } from '../utils/getCommercetoolstCurrentPriceAmount';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { validate as uuidValidate } from 'uuid';

export class CartUpdateActions implements CartUpdateActionsInterface {
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

  private ctClient: ByProjectKeyRequestBuilder;
  public setCtClient(value: ByProjectKeyRequestBuilder) {
    this.ctClient = value;
  }

  public buildActions() {
    return getCartActionBuilders()
      .flatMap((builder) => builder(this.gatherDataToRunCartActionsBuilder()))
      .filter((e) => e);
  }

  public async getPricesOfProductsFromCommercetools(
    freeUnits: StackableRedeemableResultDiscountUnit[],
  ): Promise<{
    found: { price: number; id: string }[];
    notFound: string[];
  }> {
    const productSourceIds = freeUnits.map((unit) => {
      return unit.product.source_id;
    });
    const ctProducts = await this.getCtProducts(
      this.priceSelector,
      productSourceIds,
    );

    const productsFoundInCommercetools = ctProducts
      .map((ctProduct) => {
        const unit = freeUnits.find(
          (unit) => unit.product.source_id === ctProduct.id,
        );
        if (!unit) {
          return undefined;
        }
        const price = getCommercetoolstCurrentPriceAmount(
          ctProduct,
          unit.sku.source_id,
          this.priceSelector,
        );
        return {
          id: ctProduct.id,
          price,
        };
      })
      .filter((e) => !!e);
    const productsNotFoundInCommercetools = productSourceIds.filter(
      (sourceId) =>
        !productsFoundInCommercetools
          .map((product) => product.id)
          .includes(sourceId),
    );

    return {
      found: productsFoundInCommercetools,
      notFound: productsNotFoundInCommercetools,
    };
  }

  private async getCtProducts(
    priceSelector: PriceSelector,
    productSourceIds: string[],
  ): Promise<Product[]> {
    try {
      return (
        await this.ctClient
          .products()
          .get({
            queryArgs: {
              total: false,
              priceCurrency: priceSelector.currencyCode,
              priceCountry: priceSelector.country,
              where: `id in ("${productSourceIds
                .filter((productSourceId) => uuidValidate(productSourceId))
                .join('","')}") `,
            },
          })
          .execute()
      ).body.results;
    } catch (e) {
      return [];
    }
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
