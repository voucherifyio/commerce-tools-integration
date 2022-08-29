import { StackableRedeemableResponse } from '@voucherify/sdk';

import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { CartAction } from './CartAction';

function getShippingProductSourceIds(
  applicableCoupons: StackableRedeemableResponse[],
): string[] {
  return applicableCoupons
    .filter((coupon) => coupon.result.discount.type === 'UNIT')
    .map((coupon) => {
      return coupon.result.discount.product.source_id;
    });
}

export default function addShippingProductSourceIds(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  return [
    {
      action: 'setCustomField',
      name: 'shippingProductSourceIds',
      value: getShippingProductSourceIds(
        validateCouponsResult.applicableCoupons,
      ),
    },
  ];
}
