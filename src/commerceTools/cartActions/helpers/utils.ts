import { ValidateCouponsResult } from '../../../integration/types';

export default function isValidAndNewCouponNotFailed(
  validateCouponsResult: ValidateCouponsResult,
) {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  return valid || !onlyNewCouponsFailed;
}
