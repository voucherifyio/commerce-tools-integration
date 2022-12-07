import {
  Order as CommerceToolsOrder,
  PaymentState,
} from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { Order } from '../../../integration/types';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { getCustomerFromCtOrder } from './getCustomerFromCtOrder';
import { mapLineItemsToIntegrationType } from './mapLineItemsToIntegrationType';
import { getCouponsFromCartOrOrder } from '../getCouponsFromCartOrOrder';

export function translateCtOrderToOrder(order: CommerceToolsOrder): Order {
  return {
    id: order.id,
    customer: getCustomerFromCtOrder(order),
    customerId: order.customerId || order.anonymousId,
    status: ((order.paymentState as PaymentState) === 'Paid'
      ? 'PAID'
      : 'CREATED') as OrdersCreate['status'],
    coupons: getCouponsFromCartOrOrder(order),
    items: mapLineItemsToIntegrationType(order.lineItems),
    sessionKey: order.custom?.fields.session,
    rawOrder: order,
  };
}
