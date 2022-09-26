import { ValidateCouponsResult, CartDiscountApplyMode } from '../types';
import addCustomLineItemWithDiscountSummary from './addCustomLineItemWithDiscountSummary';
import addDirectDiscountWithDiscountSummary from './addDirectDiscountWithDiscountSummary';
import addFreeLineItems from './addFreeLineItems';
import { CartActionsBuilder } from './CartAction';
import removeDiscountedCustomLineItems from './removeDiscountedCustomLineItems';
import removeFreeLineItemsForNonApplicableCoupon from './removeFreeLineItemsForNonApplicableCoupon';
import setSessionAsCustomField from './setSessionAsCustomField';
import updateDiscountsCodes from './updateDiscountCodes';
import addShippingProductSourceIds from './addShippingProductSourceIds';
import setFixedPriceForLineItems from './setFixedPriceForLineItems';
import setCouponsLimit from './setCouponsLimit';

export default function getCartActionBuilders(
  validateCouponsResult: ValidateCouponsResult,
  cartDiscountApplyMode: CartDiscountApplyMode = CartDiscountApplyMode.CustomLineItem,
): CartActionsBuilder[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  const cartActionBuilders = [setSessionAsCustomField] as CartActionsBuilder[];
  if (valid || !onlyNewCouponsFailed) {
    cartActionBuilders.push(
      ...[
        removeDiscountedCustomLineItems,
        CartDiscountApplyMode.CustomLineItem === cartDiscountApplyMode
          ? addCustomLineItemWithDiscountSummary
          : addDirectDiscountWithDiscountSummary,
        addFreeLineItems,
        removeFreeLineItemsForNonApplicableCoupon,
        addShippingProductSourceIds,
        setFixedPriceForLineItems,
        setCouponsLimit,
      ],
    );
  }

  cartActionBuilders.push(updateDiscountsCodes);

  return cartActionBuilders;
}
