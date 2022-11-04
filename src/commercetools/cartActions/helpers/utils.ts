import { ExtendedValidateCouponsResult } from '../../../integration/types';

export default function isValidAndNewCouponNotFailed(
  extendedValidateCouponsResult: ExtendedValidateCouponsResult,
) {
  const { valid, onlyNewCouponsFailed } = extendedValidateCouponsResult;

  return valid || !onlyNewCouponsFailed;
}
