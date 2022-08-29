import { Cart } from '@commercetools/platform-sdk';
import { Coupon, desarializeCoupons } from '../coupon';
import { ValidateCouponsResult } from '../types';
import { CartActionSetCustomFieldWithCoupons } from './CartAction';
import {
  FREE_SHIPPING,
  FREE_SHIPPING_UNIT_TYPE,
} from '../../consts/voucherify';

export default function updateDiscountsCodes(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetCustomFieldWithCoupons[] {
  const {
    availablePromotions,
    applicableCoupons,
    notApplicableCoupons,
    skippedCoupons,
    onlyNewCouponsFailed,
  } = validateCouponsResult;
  const oldCouponsCodes: Coupon[] = (
    cart.custom?.fields?.discount_codes ?? []
  ).map(desarializeCoupons);
  const coupons = [
    ...availablePromotions,
    ...applicableCoupons.map(
      (coupon) =>
        ({
          code: coupon.id,
          status: 'APPLIED',
          type: coupon.object,
          value:
            coupon.result.discount?.unit_type === FREE_SHIPPING_UNIT_TYPE
              ? FREE_SHIPPING
              : coupon.order?.applied_discount_amount ||
                coupon.order?.items_applied_discount_amount ||
                coupon.result?.discount?.amount_off ||
                oldCouponsCodes.find(
                  (oldCoupon) => coupon.id === oldCoupon.code,
                )?.value ||
                0,
        } as Coupon),
    ),
    ...notApplicableCoupons.map(
      (coupon) =>
        ({
          code: coupon.id,
          status: 'NOT_APPLIED',
          errMsg: coupon.result?.error?.error?.message
            ? coupon.result?.error?.error.message
            : coupon.result?.error?.message,
        } as Coupon),
    ),
  ];

  if (onlyNewCouponsFailed) {
    coupons.push(
      ...skippedCoupons.map(
        (coupon) =>
          ({
            code: coupon.id,
            status: 'APPLIED',
            value:
              oldCouponsCodes.find((oldCoupon) => coupon.id === oldCoupon.code)
                ?.value || 0,
          } as Coupon),
      ),
    );
  }

  return [
    {
      action: 'setCustomField',
      name: 'discount_codes',
      value: coupons.map((coupon) => JSON.stringify(coupon)) as string[],
    },
  ];
}
