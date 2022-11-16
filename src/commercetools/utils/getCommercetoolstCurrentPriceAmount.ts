import { Product } from '@commercetools/platform-sdk';
import { PriceSelector } from '../types';

export function getCommercetoolstCurrentPriceAmount(
  ctProduct: Product,
  productSkuSourceId: string,
  priceSelector: PriceSelector,
): number {
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

  const currentPrice = prices[0];

  return currentPrice?.value?.centAmount ? currentPrice.value.centAmount : 0;
}
