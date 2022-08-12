import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import {
  CartActionAddCustomLineItem,
  COUPON_CUSTOM_LINE_SLUG_PREFIX,
  CouponTextType,
} from './CartAction';

export default // TODO don't create addCustomLineItem action if the summary doesn't actually change
function addCustomLineItemWithDiscountSummary(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
  couponText: CouponTextType,
): CartActionAddCustomLineItem[] {
  const { totalDiscountAmount, applicableCoupons, taxCategory } =
    validateCouponsResult;

  if (applicableCoupons.length === 0) return [];
  const { currencyCode } = cart.totalPrice;
  const couponCodes = applicableCoupons.map((coupon) => coupon.id).join(', ');

  return [
    {
      action: 'addCustomLineItem',
      name: {
        [couponText.language]: COUPON_CUSTOM_LINE_SLUG_PREFIX + couponText.text,
      },
      quantity: 1,
      money: {
        centAmount: totalDiscountAmount ? -totalDiscountAmount : 0,
        type: 'centPrecision',
        currencyCode,
      },
      slug: couponCodes,
      taxCategory: {
        id: taxCategory.id,
      },
    } as CartActionAddCustomLineItem,
  ];
}
