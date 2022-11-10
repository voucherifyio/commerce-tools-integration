import { DataToRunCartActionsBuilder } from '../CartAction';

export default function isValidAndNewCouponNotFailed(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
) {
  const { valid, onlyNewCouponsFailed } = dataToRunCartActionsBuilder;

  return valid || !onlyNewCouponsFailed;
}
