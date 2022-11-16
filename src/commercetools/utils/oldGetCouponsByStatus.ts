import {
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
} from '@voucherify/sdk';

export function getCouponsByStatus(
  redeemables: StackableRedeemableResponse[],
  status: StackableRedeemableResponseStatus,
) {
  return (redeemables ?? []).filter(
    (redeemable) => redeemable.status === status,
  );
}
