import { Cart } from '@commercetools/platform-sdk';
import {
  CartActionSetDirectDiscounts,
  DataToRunCartActionsBuilder,
} from './CartAction';
import { FREE_SHIPPING_UNIT_TYPE } from '../../../consts/voucherify';

const sortDiscounts = (discounts) =>
  discounts.sort((discount1, discount2) => {
    if (discount1?.target?.predicate === 'true') return 1;
    if (discount2?.target?.predicate === 'true') return -1;
    return -1;
  });

export default function addDirectDiscountWithDiscountSummary(
  cart: Cart,
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartActionSetDirectDiscounts[] {
  const { applicableCoupons } = dataToRunCartActionsBuilder;
  if (applicableCoupons.length === 0)
    return [
      {
        action: 'setDirectDiscounts',
        discounts: [],
      },
    ];
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
      return;
    }

    coupon.order.items.forEach((item) => {
      if (item.product_id === FREE_SHIPPING_UNIT_TYPE) {
        return;
      }

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
      discounts: sortDiscounts(discounts),
    },
  ];
}
