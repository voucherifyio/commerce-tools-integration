import { ValidateCouponsResult } from '../types';
import addCustomLineItemWithDiscountSummary from './addCustomLineItemWithDiscountSummary';
import addFreeLineItems from './addFreeLineItems';
import { CartActionsBuilder } from './CartAction';
import removeDiscountedCustomLineItems from './removeDiscountedCustomLineItems';
import removeFreeLineItemsForNonApplicableCoupon from './removeFreeLineItemsForNonApplicableCoupon';
import setSessionAsCustomField from './setSessionAsCustomField';
import updateDiscountsCodes from './updateDiscountCodes';
import addShippingProductSourceIds from './addShippingProductSourceIds';

export default function getCartActionBuilders(
  validateCouponsResult: ValidateCouponsResult,
): CartActionsBuilder[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  const cartActionBuilders = [setSessionAsCustomField] as CartActionsBuilder[];
  if (valid || !onlyNewCouponsFailed) {
    cartActionBuilders.push(
      ...[
        removeDiscountedCustomLineItems,
        addCustomLineItemWithDiscountSummary,
        addFreeLineItems,
        removeFreeLineItemsForNonApplicableCoupon,
        addShippingProductSourceIds,
      ],
    );
  }
  cartActionBuilders.push(updateDiscountsCodes);

  return cartActionBuilders;
}
