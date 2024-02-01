import { StackableRedeemableResponse } from '@voucherify/sdk';

export function checkIfAllInapplicableCouponsArePromotionTier(
  notApplicableCoupons: StackableRedeemableResponse[],
) {
  const inapplicableCouponsPromotionTier = notApplicableCoupons.filter(
    (notApplicableCoupon) => notApplicableCoupon.object === 'promotion_tier',
  );

  return (
    notApplicableCoupons.length === inapplicableCouponsPromotionTier.length
  );
}
