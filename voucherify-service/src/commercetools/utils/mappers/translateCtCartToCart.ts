import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import { Cart } from '../../../integration/types';
import { getSessionFromCtCart } from './getSessionFromCtCart';
import { mapLineItemsToIntegrationType } from './mapLineItemsToIntegrationType';
import { getCouponsFromCartOrOrder } from '../getCouponsFromCartOrOrder';

export function translateCtCartToCart(cart: CommerceToolsCart): Cart {
  return {
    id: cart.id,
    customerId: cart?.customerId,
    anonymousId: cart?.anonymousId,
    sessionKey: getSessionFromCtCart(cart),
    coupons: getCouponsFromCartOrOrder(cart),
    items: mapLineItemsToIntegrationType(cart.lineItems),
  };
}
