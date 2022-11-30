import {
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { Coupon } from '../types';

export function checkIfAllInapplicableCouponsArePromotionTier(
  notApplicableCoupons: StackableRedeemableResponse[],
) {
  const inapplicableCouponsPromitonTier = notApplicableCoupons.filter(
    (notApplicableCoupon) => notApplicableCoupon.object === 'promotion_tier',
  );

  return notApplicableCoupons.length === inapplicableCouponsPromitonTier.length;
}

export function filterCouponsByLimit(coupons: Coupon[], couponsLimit = 5) {
  const deletedCoupons = coupons.filter(
    (coupon) => coupon.status === 'DELETED',
  );
  const newCoupons = coupons.filter((coupon) => coupon.status === 'NEW');
  const applicableCoupons = coupons.filter(
    (coupon) => coupon.status === 'APPLIED',
  );
  return [
    ...[...applicableCoupons, ...newCoupons].splice(0, couponsLimit),
    ...deletedCoupons,
  ];
}

export function calculateTotalDiscountAmount(
  validatedCoupons: ValidationValidateStackableResponse,
) {
  const allItems = validatedCoupons.redeemables.flatMap(
    (redeemable) => redeemable.order.items,
  );
  const totalDiscountAmount = allItems.reduce((total, item) => {
    return (
      total + (item as any)?.total_applied_discount_amount ||
      (item as any)?.total_discount_amount ||
      0
    );
  }, 0);

  if (totalDiscountAmount === 0) {
    return (
      validatedCoupons.order?.total_applied_discount_amount ??
      validatedCoupons.order?.total_discount_amount ??
      0
    );
  }

  if (totalDiscountAmount > (validatedCoupons?.order?.amount ?? 0)) {
    return validatedCoupons.order.amount;
  }
  return totalDiscountAmount;
}
