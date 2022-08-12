import { Cart } from '@commercetools/platform-sdk';
import {
  CartActionRemoveCustomLineItem,
  COUPON_CUSTOM_LINE_SLUG_PREFIX,
} from './CartAction';

export default function removeDiscountedCustomLineItems(
  cart: Cart,
): CartActionRemoveCustomLineItem[] {
  return (cart.customLineItems || [])
    .filter((lineItem) =>
      Object.keys(lineItem.name).find((key) =>
        lineItem.name[key].startsWith(COUPON_CUSTOM_LINE_SLUG_PREFIX),
      ),
    )
    .map(
      (lineItem) =>
        ({
          action: 'removeCustomLineItem',
          customLineItemId: lineItem.id,
        } as CartActionRemoveCustomLineItem),
    );
}
