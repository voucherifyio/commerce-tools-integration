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

export function filterCouponsByLimit(coupons: Coupon[], couponsLimit: number) {
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
  let totalDiscountAmount = 0;
  if (
    validatedCoupons.redeemables.find(
      (redeemable) => redeemable?.order?.items?.length,
    )
  ) {
    //Voucherify "order.total_applied_discount_amount" is not always calculated correctly,
    //so we need to iterate through the items to calculated discounted amount
    validatedCoupons.redeemables.forEach((redeemable) => {
      redeemable.order.items.forEach((item) => {
        if ((item as any).total_applied_discount_amount) {
          totalDiscountAmount += (item as any).total_applied_discount_amount;
        } else if ((item as any).total_discount_amount) {
          totalDiscountAmount += (item as any).total_discount_amount;
        }
      });
    });
  }

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
