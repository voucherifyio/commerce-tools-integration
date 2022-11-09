import { Cart } from '@commercetools/platform-sdk';
import { ExtendedValidateCouponsResult } from '../../../integration/types';
import { CartAction } from '../CartAction';

export default function removeFreeLineItemsForNonApplicableCoupon(
  cart: Cart,
  extendedValidateCouponsResult: ExtendedValidateCouponsResult,
): CartAction[] {
  const cartActions: CartAction[] = [];
  const { productsToAdd } = extendedValidateCouponsResult;
  cart.lineItems
    .filter((item) => item.custom?.fields?.applied_codes)
    .forEach((item) => {
      const quantityFromCode =
        item.custom?.fields.applied_codes
          .map((code) => JSON.parse(code))
          .filter((code) => code.type === 'UNIT')
          .find(
            (code) =>
              !productsToAdd
                .map((unitCode) => unitCode.code)
                .includes(code.code),
          )?.quantity ?? 0;

      if (item.quantity > quantityFromCode) {
        cartActions.push({
          action: 'setLineItemCustomField',
          lineItemId: item.id,
          name: 'applied_codes',
        });
      }

      if (item.quantity >= quantityFromCode) {
        cartActions.push({
          action: 'removeLineItem',
          lineItemId: item.id,
          quantity: quantityFromCode,
        });
      }
    });

  return cartActions;
}