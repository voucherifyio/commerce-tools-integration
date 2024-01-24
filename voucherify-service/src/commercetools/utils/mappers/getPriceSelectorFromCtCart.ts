import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import { PriceSelector } from '../../types';

export function getPriceSelectorFromCtCart(
  cart: CommerceToolsCart,
): PriceSelector {
  return {
    country: cart.country,
    currencyCode: cart.totalPrice.currencyCode,
    customerGroup: cart.customerGroup,
    distributionChannels: [
      ...new Set(
        cart.lineItems
          .map((item) => item.distributionChannel)
          .filter((item) => item != undefined),
      ),
    ],
  };
}
