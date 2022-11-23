import { Product, TaxCategory } from '@commercetools/platform-sdk';
import { availablePromotion, ProductToAdd } from '../../integration/types';
import {
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResultDiscountUnit,
} from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import getCartActionBuilders from './cart-update-actions/getCartActionBuilders';
import { checkIfAllInapplicableCouponsArePromotionTier } from '../../integration/utils/helperFunctions';
import { DataToRunCartActionsBuilder } from './cart-update-actions/CartAction';
import { CartDiscountApplyMode, PriceSelector } from '../types';
import { getCommercetoolstCurrentPriceAmount } from '../utils/getCommercetoolstCurrentPriceAmount';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { isUuid } from '../utils/isUUID';

interface ProductWithCurrentPriceAmount extends Product {
  currentPriceAmount: number;
  unit: StackableRedeemableResultDiscountUnit;
  item: OrdersItem;
}

export class CartUpdateActions {
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

  public async getProductsToAdd(
    discountTypeUnit: StackableRedeemableResponse[],
  ): Promise<ProductToAdd[]> {
    const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

    const freeProductsToAdd = discountTypeUnit.flatMap(
      async (unitTypeRedeemable) => {
        const discount = unitTypeRedeemable.result?.discount;
        if (!discount) {
          return [];
        }
        const freeUnits = (
          discount.units
            ? discount.units
            : [{ ...discount } as StackableRedeemableResultDiscountUnit]
        ).filter((unit) => APPLICABLE_PRODUCT_EFFECT.includes(unit.effect));
        if (!freeUnits.length) {
          return [];
        }
        await this.getCtProductsWithCurrentPriceAmount(
          freeUnits,
          unitTypeRedeemable.order.items,
        );
        const productsToAdd = (
          await this.getCtProductsWithCurrentPriceAmount(
            freeUnits,
            unitTypeRedeemable.order.items,
          )
        ).map((productToAdd) => {
          return {
            code: unitTypeRedeemable.id,
            effect: productToAdd.unit.effect,
            quantity: productToAdd.unit.unit_off,
            product: productToAdd.unit.sku.source_id,
            initial_quantity: productToAdd.item.initial_quantity,
            discount_quantity: productToAdd.item.discount_quantity,
            discount_difference:
              productToAdd.item?.applied_discount_amount -
                productToAdd.currentPriceAmount *
                  productToAdd.item?.discount_quantity !==
              0,
            applied_discount_amount: productToAdd.currentPriceAmount,
            distributionChannel: this.priceSelector?.distributionChannels[0],
          } as ProductToAdd;
        });

        return Promise.all(productsToAdd);
      },
    );

    return Promise.all(freeProductsToAdd).then((response) => {
      return response.flatMap((element) => {
        return element;
      });
    });
  }

  private async getCtProductsWithCurrentPriceAmount(
    freeUnits: StackableRedeemableResultDiscountUnit[],
    orderItems: OrdersItem[],
  ): Promise<ProductWithCurrentPriceAmount[]> {
    const productSourceIds = freeUnits.map((unit) => {
      return unit.product.source_id;
    });
    const ctProducts = await this.getCtProducts(
      this.priceSelector,
      productSourceIds,
    );

    return ctProducts.map((ctProduct) => {
      const unit = freeUnits.find(
        (unit) => unit.product.source_id === ctProduct.id,
      );
      const currentPriceAmount = getCommercetoolstCurrentPriceAmount(
        ctProduct,
        unit.sku.source_id,
        this.priceSelector,
      );
      const item = orderItems?.find(
        (item) => item?.sku?.source_id === unit.sku.source_id,
      ) as OrdersItem;
      return { ...ctProduct, currentPriceAmount, unit, item };
    });
  }

  private async getCtProducts(
    priceSelector: PriceSelector,
    productSourceIds: string[],
  ): Promise<Product[]> {
    const uuidProductSourceIds = productSourceIds.filter((productSourceId) =>
      isUuid(productSourceId),
    );
    if (uuidProductSourceIds.length === 0) return [];
    try {
      return (
        await this.ctClient
          .products()
          .get({
            queryArgs: {
              total: false,
              priceCurrency: priceSelector.currencyCode,
              priceCountry: priceSelector.country,
              where: `id in ("${uuidProductSourceIds.join('","')}") `,
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
