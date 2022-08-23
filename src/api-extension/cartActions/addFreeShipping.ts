import { StackableRedeemableResponse } from '@voucherify/sdk';
import { FREE_SHIPPING_UNIT_TYPE } from '../../consts/voucherify';
import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { CartAction } from './CartAction';

function checkIsFreeShippingApplied(
  applicableCoupons: StackableRedeemableResponse[],
): boolean {
  applicableCoupons = applicableCoupons.filter(
    (coupon) => coupon.result.discount.unit_type === FREE_SHIPPING_UNIT_TYPE,
  );

  return applicableCoupons.length > 0;
}

export default function addFreeShipping(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  return [
    {
      action: 'setCustomField',
      name: 'freeShipping',
      value: checkIsFreeShippingApplied(
        validateCouponsResult.applicableCoupons,
      ),
    },
  ];
}
