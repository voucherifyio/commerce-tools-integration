import {
  StackableRedeemableResponseStatus,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';

export function getCouponsByStatus(
  validatedCoupons: ValidationValidateStackableResponse,
  status: StackableRedeemableResponseStatus,
) {
  return (validatedCoupons?.redeemables ?? []).filter(
    (redeemable) => redeemable.status === status,
  );
}
