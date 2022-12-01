import { FREE_SHIPPING_UNIT_TYPE } from '../../consts/voucherify';
import { ValidationValidateStackableResponse } from '@voucherify/sdk';

export function getUnitTypeRedeemablesFromStackableResponse(
  validatedCoupons: ValidationValidateStackableResponse,
) {
  return validatedCoupons.redeemables.filter(
    (redeemable) =>
      redeemable.result?.discount?.type === 'UNIT' &&
      redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE,
  );
}
