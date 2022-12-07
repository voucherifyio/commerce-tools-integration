import { Order } from '@commercetools/platform-sdk';

export class OrderMapper {
  public getOrderObject(order: Order) {
    return {
      object: 'order',
      source_id: order.id,
      created_at: order.createdAt,
      updated_at: order.lastModifiedAt,
      status: 'PAID',
      customer: {
        object: 'customer',
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
      },
      items: order.lineItems.map((item) => {
        return {
          source_id: item.variant.sku,
          related_object: 'sku',
          quantity: item.quantity,
          price: item.price.value.centAmount,
          amount: item.quantity * item.price.value.centAmount,
          product: {
            name: Object?.values(item.name)?.[0],
          },
          sku: {
            sku: Object?.values(item.name)?.[0],
          },
        };
      }),
    };
  }
}
