import { ValidateCouponsResult } from '../../types';

export default function isValidAndNewCouponNotFailed(
  validateCouponsResult: ValidateCouponsResult,
) {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  return valid || !onlyNewCouponsFailed;
}
