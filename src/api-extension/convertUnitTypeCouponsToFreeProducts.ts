import {
  OrdersItem,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { PriceSelector, ProductToAdd } from './types';
import { FREE_SHIPPING_UNIT_TYPE } from '../consts/voucherify';

const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

// TODO: to delete once @voucherify/sdk is being updated
interface ExtendedOrdersItem extends OrdersItem {
  initial_quantity?: number;
  applied_discount_amount?: number;
  discount_quantity?: number;
  product?: {
    source_id: string;
    override?: boolean;
    name?: string;
    metadata?: Record<string, any>;
  };
}

async function getCtProducts(
  productSourceIds: string[],
  priceSelector: PriceSelector,
  ctClient,
) {
  return await ctClient
    .products()
    .get({
      queryArgs: {
        total: false,
        priceCurrency: priceSelector.currencyCode,
        priceCountry: priceSelector.country,
        where: `id in ("${productSourceIds.join('","')}") `,
      },
    })
    .execute();
}

async function getCtVariantPrice(
  ctProduct,
  productSkuSourceId: string,
  priceSelector: PriceSelector,
) {
  let ctVariants =
    ctProduct.masterData.current.variants.length > 0
      ? ctProduct.masterData.current.variants
      : [ctProduct.masterData.current.masterVariant];

  ctVariants = ctVariants.filter(
    (variant) => variant.sku === productSkuSourceId,
  );

  const prices = [];
  // price.country and price.customerGroup could be set to 'any' we don't to
  // remove these elements from prices
  // The priority order for the selection of the price is customer group > channel > country
  // https://docs.commercetools.com/api/projects/carts#lineitem-price-selection
  ctVariants.map((variant) => {
    let filteredPrices = variant.prices;

    if (priceSelector.customerGroup) {
      const customerGroupPrices = filteredPrices.filter(
        (price) =>
          price.customerGroup &&
          price.customerGroup.typeId === priceSelector.customerGroup.typeId &&
          price.customerGroup.id === priceSelector.customerGroup.id,
      );

      if (customerGroupPrices.length) {
        filteredPrices = customerGroupPrices;
      }
    }

    if (priceSelector.distributionChannels.length) {
      const channel = priceSelector.distributionChannels[0];
      const channelsPrices = filteredPrices.filter(
        (price) =>
          price.channel &&
          price.channel.typeId === channel.typeId &&
          price.channel.id === channel.id,
      );

      if (channelsPrices.length) {
        filteredPrices = channelsPrices;
      }
    }

    filteredPrices = filteredPrices.filter(
      (price) =>
        price.value.currencyCode === priceSelector.currencyCode &&
        (!price.country || price.country === priceSelector.country),
    );

    prices.push(
      ...filteredPrices.filter((price) => price.country),
      ...filteredPrices.filter((price) => !price.country),
    );
  });

  return prices;
}

export default async function convertUnitTypeCouponsToFreeProducts(
  response: ValidationValidateStackableResponse,
  ctClient,
  priceSelector: PriceSelector,
): Promise<ProductToAdd[]> {
  const discountTypeUnit = response.redeemables.filter(
    (redeemable) =>
      redeemable.result?.discount?.type === 'UNIT' &&
      redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE,
  );
  const freeProductsToAdd = discountTypeUnit.flatMap(
    async (unitTypeRedeemable) => {
      const { effect: discountEffect } = unitTypeRedeemable.result?.discount;

      if (APPLICABLE_PRODUCT_EFFECT.includes(discountEffect)) {
        const freeItem = unitTypeRedeemable.order?.items?.find(
          (item: ExtendedOrdersItem) =>
            item.product?.source_id ===
            unitTypeRedeemable.result?.discount?.product?.source_id,
        ) as ExtendedOrdersItem;
        const productSourceId =
          unitTypeRedeemable.result.discount.product.source_id;
        const productSkuSourceId =
          unitTypeRedeemable.result.discount.sku.source_id;
        const ctProducts = await getCtProducts(
          [productSourceId],
          priceSelector,
          ctClient,
        );
        const prices = await getCtVariantPrice(
          ctProducts.body.results[0],
          productSkuSourceId,
          priceSelector,
        );
        const currentPrice = prices[0];
        const currentPriceAmount = currentPrice
          ? currentPrice.value.centAmount
          : 0;

        return [
          {
            code: unitTypeRedeemable.id,
            effect: unitTypeRedeemable.result?.discount?.effect,
            quantity: unitTypeRedeemable.result?.discount?.unit_off,
            product: unitTypeRedeemable.result?.discount.sku.source_id,
            initial_quantity: freeItem?.initial_quantity,
            discount_quantity: freeItem?.discount_quantity,
            discount_difference:
              freeItem?.applied_discount_amount -
              currentPriceAmount * freeItem?.discount_quantity,
            applied_discount_amount: currentPriceAmount,
            distributionChannel: priceSelector.distributionChannels[0],
          } as ProductToAdd,
        ] as ProductToAdd[];
      }

      if (discountEffect === 'ADD_MANY_ITEMS') {
        const filteredProducts =
          unitTypeRedeemable.result.discount.units.filter((product) =>
            APPLICABLE_PRODUCT_EFFECT.includes(product.effect),
          );
        const productSourceIds = filteredProducts.map((product) => {
          return product.product.source_id;
        });
        const ctProducts = await getCtProducts(
          productSourceIds,
          priceSelector,
          ctClient,
        );
        const productsToAdd = filteredProducts.map(async (product) => {
          const freeItem = unitTypeRedeemable.order?.items?.find(
            (item: ExtendedOrdersItem) =>
              item.product.source_id === product.product.source_id,
          ) as ExtendedOrdersItem;
          const ctProduct = ctProducts.body.results.filter((ctProduct) => {
            return ctProduct.id === product.product.source_id;
          })[0];
          const prices = await getCtVariantPrice(
            ctProduct,
            product.sku.source_id,
            priceSelector,
          );
          const currentPrice = prices[0];
          const currentPriceAmount = currentPrice
            ? currentPrice.value.centAmount
            : 0;
          return {
            code: unitTypeRedeemable.id,
            effect: product.effect,
            quantity: product.unit_off,
            product: product.sku.source_id,
            initial_quantity: freeItem.initial_quantity,
            discount_quantity: freeItem.discount_quantity,
            discount_difference:
              freeItem?.applied_discount_amount -
              currentPriceAmount * freeItem?.discount_quantity,
            applied_discount_amount: currentPriceAmount,
            distributionChannel: priceSelector.distributionChannels[0],
          } as ProductToAdd;
        });

        return Promise.all(productsToAdd);
      }

      return [] as ProductToAdd[];
    },
  );

  return Promise.all(freeProductsToAdd).then((response) => {
    return response.flatMap((element) => {
      return element;
    });
  });
}
