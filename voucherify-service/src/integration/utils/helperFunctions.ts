import {
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';

export function checkIfAllInapplicableCouponsArePromotionTier(
  notApplicableCoupons: StackableRedeemableResponse[],
) {
  const inapplicableCouponsPromitonTier = notApplicableCoupons.filter(
    (notApplicableCoupon) => notApplicableCoupon.object === 'promotion_tier',
  );

  return notApplicableCoupons.length === inapplicableCouponsPromitonTier.length;
}

export function calculateTotalDiscountAmount(
  validatedCoupons: ValidationValidateStackableResponse,
) {
  const allItems = validatedCoupons.redeemables.flatMap(
    (redeemable) => redeemable.order.items,
  );
  const totalDiscountAmount = allItems.reduce((total, item) => {
    return total + (item as any)?.total_applied_discount_amount || 0;
  }, 0);

  if (totalDiscountAmount === 0) {
    return validatedCoupons.order?.total_applied_discount_amount ?? 0;
  }

  if (totalDiscountAmount > (validatedCoupons?.order?.amount ?? 0)) {
    return validatedCoupons.order.amount;
  }
  return totalDiscountAmount;
}
