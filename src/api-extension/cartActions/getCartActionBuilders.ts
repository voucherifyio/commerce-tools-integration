import { ValidateCouponsResult } from '../types';
import addFreeLineItems from './addFreeLineItems';
import { CartActionsBuilder } from './CartAction';
import removeFreeLineItemsForNonApplicableCoupon from './removeFreeLineItemsForNonApplicableCoupon';
import setFixedPriceForLineItems from './setFixedPriceForLineItems';
import setCustomFields from './new/setCustomFields';
import customLineItems from './new/customLineItems';
import lineItemsAndTheirCustomFields from './new/lineItemsAndTheirCustomFields';

export default function getCartActionBuilders(
  validateCouponsResult: ValidateCouponsResult,
): CartActionsBuilder[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  const cartActionBuilders = [] as CartActionsBuilder[]; //setCustomField

  cartActionBuilders.push(
    ...[setCustomFields, customLineItems, lineItemsAndTheirCustomFields],
  );

  if (valid || !onlyNewCouponsFailed) {
    cartActionBuilders.push(
      ...[
        // removeDiscountedCustomLineItems, //removeCustomLineItem
        // addCustomLineItemWithDiscountSummary, //addCustomLineItem
        // setFixedPriceForLineItems, //setLineItemCustomType
        // addFreeLineItems, //setLineItemCustomType //addLineItem //changeLineItemQuantity
        // removeFreeLineItemsForNonApplicableCoupon, //setLineItemCustomField //removeLineItem
        // addShippingProductSourceIds, //setCustomField
        // setCouponsLimit, //setCustomField
      ],
    );
  }

  // cartActionBuilders.push(updateDiscountsCodes); //setCustomField

  // const newCartActionsBuilder = [] as CartActionsBuilder[];

  return cartActionBuilders;
}
