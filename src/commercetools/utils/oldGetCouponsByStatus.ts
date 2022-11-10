import {
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';

export function oldGetCouponsByStatus(
  validatedCoupons: ValidationValidateStackableResponse,
  status: StackableRedeemableResponseStatus,
) {
  return (validatedCoupons?.redeemables ?? []).filter(
    (redeemable) => redeemable.status === status,
  );
}

export function getCouponsByStatus(
  redeemables: StackableRedeemableResponse[],
  status: StackableRedeemableResponseStatus,
) {
  return (redeemables ?? []).filter(
    (redeemable) => redeemable.status === status,
  );
}
