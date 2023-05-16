import { Order } from '../../types';
import { OrdersItem, RedemptionsRedeemStackableParams } from '@voucherify/sdk';

export function buildRedeemStackableRequestForVoucherify(
  order: Order,
  items: OrdersItem[],
  orderMetadata: Record<string, any>,
): RedemptionsRedeemStackableParams {
  return {
    session: {
      type: 'LOCK',
      key: order.sessionKey,
    },
    redeemables: order.coupons.map((code) => {
      return {
        object: code.type ? code.type : 'voucher',
        id: code.code,
      };
    }),
    order: {
      source_id: order.id,
      amount: order.items.reduce((acc, item) => acc + item.amount, 0),
      status: 'PAID',
      items,
      metadata: orderMetadata,
    },
    customer: order.customer,
  } as RedemptionsRedeemStackableParams;
}
