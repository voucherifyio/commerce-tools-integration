import { ValidateCouponsResult } from '../types';
import addCustomLineItemWithDiscountSummary from './addCustomLineItemWithDiscountSummary';
import addFreeLineItems from './addFreeLineItems';
import { CartActionsBuilder } from './CartAction';
import removeDiscountedCustomLineItems from './removeDiscountedCustomLineItems';
import removeFreeLineItemsForNonApplicableCoupon from './removeFreeLineItemsForNonApplicableCoupon';
import setFixedPriceForLineItems from './setFixedPriceForLineItems';
import setCustomFields from './new/setCustomFields';

export default function getCartActionBuilders(
  validateCouponsResult: ValidateCouponsResult,
): CartActionsBuilder[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  const cartActionBuilders = [] as CartActionsBuilder[]; //setCustomField

  if (valid || !onlyNewCouponsFailed) {
    cartActionBuilders.push(
      ...[
        removeDiscountedCustomLineItems, //removeCustomLineItem
        addCustomLineItemWithDiscountSummary, //addCustomLineItem
        setFixedPriceForLineItems, //setLineItemCustomType
        addFreeLineItems, //setLineItemCustomType //addLineItem //changeLineItemQuantity
        removeFreeLineItemsForNonApplicableCoupon, //setLineItemCustomField //removeLineItem
        // addShippingProductSourceIds, //setCustomField
        // setCouponsLimit, //setCustomField
      ],
    );
  }

  // cartActionBuilders.push(updateDiscountsCodes); //setCustomField


  // const newCartActionsBuilder = [] as CartActionsBuilder[];

  cartActionBuilders.push(...[setCustomFields]);

  return cartActionBuilders;
}
