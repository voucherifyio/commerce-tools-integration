import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import {
  CartActionAddCustomLineItem,
  COUPON_CUSTOM_LINE_NAME_PREFIX,
} from './CartAction';

export default // TODO don't create addCustomLineItem action if the summary doesn't actually change
function addCustomLineItemWithDiscountSummary(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
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
        en: `${COUPON_CUSTOM_LINE_NAME_PREFIX}coupon value => ${(
          totalDiscountAmount / 100
        ).toFixed(2)}`,
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
