import { Product } from '@commercetools/platform-sdk';
import { PriceSelector } from '../types';

export function getCommercetoolstCurrentPriceAmount(
  ctProduct: Product,
  productSkuSourceId: string,
  priceSelector: PriceSelector,
): number {
  const ctVariants = (
    ctProduct.masterData.current.variants.length > 0
      ? ctProduct.masterData.current.variants
      : [ctProduct.masterData.current.masterVariant]
  ).filter((variant) => variant.sku === productSkuSourceId);

  // The priority order for the selection of the price is customer group > channel > country
  // https://docs.commercetools.com/api/projects/carts#lineitem-price-selection
  const { currencyCode, country, customerGroup, distributionChannels } =
    priceSelector;
  return (
    ctVariants.flatMap((variant) => {
      return variant.prices
        .filter((priceVariant) => {
          //currencyCode
          return priceVariant?.value?.currencyCode === currencyCode;
        })
        .filter((priceVariant) => {
          //country
          return priceVariant?.country === country;
        })
        .filter((priceVariant) => {
          //customerGroup
          if (customerGroup) {
            return (
              priceVariant?.customerGroup?.typeId === customerGroup.typeId &&
              priceVariant?.customerGroup?.id === customerGroup.id
            );
          }
          return !priceVariant?.customerGroup;
        })
        .filter((priceVariant) => {
          //distributionChannels
          if (!(distributionChannels?.length > 0) && !priceVariant?.channel) {
            return true;
          }
          if (distributionChannels.length > 0 && !priceVariant?.channel) {
            return false;
          }
          distributionChannels.forEach((currentChannel) => {
            if (
              priceVariant.channel.typeId === currentChannel.typeId &&
              priceVariant.channel.id === currentChannel.id
            ) {
              return true;
            }
          });
          return false;
        });
    })?.[0]?.value?.centAmount || 0
  );
}
