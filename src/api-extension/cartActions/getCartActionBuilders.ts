import { ValidateCouponsResult, CartDiscountApplyMode } from '../types';
import { CartActionsBuilder } from './CartAction';
import setCustomFields from './builderActions/setCustomFields';
import customLineItems from './builderActions/customLineItems';
import addDirectDiscountWithDiscountSummary from './addDirectDiscountWithDiscountSummary';
import lineItemsAndTheirCustomFields from './builderActions/lineItemsAndTheirCustomFields';

export default function getCartActionBuilders(
  validateCouponsResult: ValidateCouponsResult,
  cartDiscountApplyMode: CartDiscountApplyMode = CartDiscountApplyMode.CustomLineItem,
): CartActionsBuilder[] {
  const cartActionBuilders = [] as CartActionsBuilder[];

  cartActionBuilders.push(
    ...[
      customLineItems,
      lineItemsAndTheirCustomFields,
      setCustomFields,
      // CartDiscountApplyMode.CustomLineItem === cartDiscountApplyMode
      //   ? setCustomFields
      //   : ,
    ],
  );

  return cartActionBuilders;
}
