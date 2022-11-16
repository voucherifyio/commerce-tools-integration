import { Order as CommerceToolsOrder } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';

export function getCustomerFromCtOrder(order: CommerceToolsOrder) {
  return {
    source_id: order.customerId || order.anonymousId,
    name: `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`,
    email: order.shippingAddress?.email,
    address: {
      city: order.shippingAddress?.city,
      country: order.shippingAddress?.country,
      postal_code: order.shippingAddress?.postalCode,
      line_1: order.shippingAddress?.streetName,
    },
    phone: order.shippingAddress?.phone,
  };
}
