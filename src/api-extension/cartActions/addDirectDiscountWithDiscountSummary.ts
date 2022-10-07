import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { CartActionSetDirectDiscounts } from './CartAction';

export default function addDirectDiscountWithDiscountSummary(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetDirectDiscounts[] {
  const { applicableCoupons } = validateCouponsResult;
  if (applicableCoupons.length === 0) return [];
  const { currencyCode } = cart.totalPrice;

  const discounts = [];

  applicableCoupons.forEach((coupon) => {
    if (coupon.result.discount.effect === 'APPLY_TO_ORDER') {
      discounts.push({
        target: {
          type: 'lineItems',
          predicate: 'true',
        },
        value: {
          type: 'absolute',
          money: [
            {
              centAmount:
                coupon?.order?.total_applied_discount_amount ||
                coupon.order?.applied_discount_amount ||
                0,
              currencyCode,
            },
          ],
        },
      });
    }
    coupon.order.items.forEach((item) => {
      if (item?.applied_discount_amount) {
        discounts.push({
          target: {
            type: 'lineItems',
            predicate: item?.sku?.source_id
              ? `sku="${item?.sku?.source_id}"`
              : 'true',
          },
          value: {
            type: 'absolute',
            money: [
              {
                centAmount: item.applied_discount_amount,
                currencyCode,
              },
            ],
          },
        });
      }
    });
  });

  return [
    {
      action: 'setDirectDiscounts',
      discounts,
    },
  ];
}
