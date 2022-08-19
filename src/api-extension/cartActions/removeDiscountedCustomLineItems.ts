import { Cart } from '@commercetools/platform-sdk';
import {
  CartActionRemoveCustomLineItem,
  COUPON_CUSTOM_LINE_SLUG,
} from './CartAction';

export default function removeDiscountedCustomLineItems(
  cart: Cart,
): CartActionRemoveCustomLineItem[] {
  return (cart.customLineItems || [])
    .filter((lineItem) => lineItem.slug.startsWith(COUPON_CUSTOM_LINE_SLUG))
    .map(
      (lineItem) =>
        ({
          action: 'removeCustomLineItem',
          customLineItemId: lineItem.id,
        } as CartActionRemoveCustomLineItem),
    );
}
