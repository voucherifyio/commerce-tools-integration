import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { CartActionSetDirectDiscounts } from './CartAction';

export default function addDirectDiscountWithDiscountSummary(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetDirectDiscounts[] {
  const { totalDiscountAmount, applicableCoupons } = validateCouponsResult;
  if (applicableCoupons.length === 0) return [];
  const { currencyCode } = cart.totalPrice;

  return [
    {
      action: 'setDirectDiscounts',
      discounts: [
        {
          target: { type: 'lineItems', predicate: 'true' },
          value: {
            type: 'absolute',
            money: [
              {
                centAmount: totalDiscountAmount || 0,
                currencyCode,
              },
            ],
          },
        },
      ],
    },
  ];
}
