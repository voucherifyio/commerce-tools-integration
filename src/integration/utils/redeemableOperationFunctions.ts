import {
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
} from '@voucherify/sdk';
import { FREE_SHIPPING_UNIT_TYPE } from '../../consts/voucherify';
import { ValidationValidateStackableResponse } from '@voucherify/sdk';

export function getRedeemablesByStatus(
  redeemables: StackableRedeemableResponse[],
  status: StackableRedeemableResponseStatus,
): StackableRedeemableResponse[] {
  return (redeemables ?? []).filter(
    (redeemable) => redeemable.status === status,
  );
}

export function codesFromRedeemables(
  redeemables: StackableRedeemableResponse[],
): string[] {
  return (redeemables ?? []).map((redeemable) => redeemable.id);
}

export function getUnitTypeRedeemablesFromStackableResponse(
  validatedCoupons: ValidationValidateStackableResponse,
) {
  return validatedCoupons.redeemables.filter(
    (redeemable) =>
      redeemable.result?.discount?.type === 'UNIT' &&
      redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE,
  );
}

export function filterOutRedeemablesIfCodeIn(
  redeemables: StackableRedeemableResponse[],
  forbiddenCodes: string[],
) {
  return redeemables.filter(
    (redeemable) => !forbiddenCodes.includes(redeemable.id),
  );
}
