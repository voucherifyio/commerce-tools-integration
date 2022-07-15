import { Cart } from '@commercetools/platform-sdk';
import {
  CartActionRemoveCustomLineItem,
  COUPON_CUSTOM_LINE_NAME_PREFIX,
} from './CartAction';

export default function removeDiscountedCustomLineItems(
  cart: Cart,
): CartActionRemoveCustomLineItem[] {
  return (cart.customLineItems || [])
    .filter((lineItem) =>
      lineItem.name.en.startsWith(COUPON_CUSTOM_LINE_NAME_PREFIX),
    )
    .map(
      (lineItem) =>
        ({
          action: 'removeCustomLineItem',
          customLineItemId: lineItem.id,
        } as CartActionRemoveCustomLineItem),
    );
}
