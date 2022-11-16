import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';

export function getSessionFromCtCart(
  cart: CommerceToolsCart,
): string | undefined {
  return cart.custom?.fields?.session ?? undefined;
}
