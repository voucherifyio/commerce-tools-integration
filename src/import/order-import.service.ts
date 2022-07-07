import { Injectable } from '@nestjs/common';
import { Order } from '@commercetools/platform-sdk';
import { CommerceToolsConnectorService } from '../commerceTools/commerce-tools-connector.service';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';

@Injectable()
export class OrderImportService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly voucherifyClient: VoucherifyConnectorService,
  ) {}

  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    OrderImportService.name,
  );

  private async *getAllOrders(fetchPeriod?: number): AsyncGenerator<Order[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    let page = 0;
    let allOrdersCollected = false;

    const date = new Date();
    if (fetchPeriod) {
      date.setDate(date.getDate() - fetchPeriod);
    }

    do {
      const ordersResult = await ctClient
        .orders()
        .get({
          queryArgs: {
            limit: limit,
            offset: page * limit,
            ...(fetchPeriod && {
              where: `lastModifiedAt>="${date.toJSON()}" or createdAt>="${date.toJSON()}"`,
            }),
          },
        })
        .execute();
      yield ordersResult.body.results;
      page++;
      if (ordersResult.body.total < page * limit) {
        allOrdersCollected = true;
      }
      this.logger.info({
        msg: 'iterating over all orders',
        orders: limit * page,
        total: ordersResult.body.total,
      });
    } while (!allOrdersCollected);
  }

  public async migrateOrders(period?: number) {
    const orders = [];

    for await (const ordersBatch of this.getAllOrders(period)) {
      ordersBatch.forEach((order) => {
        if (order.paymentState !== 'Paid') {
          return;
        }

        orders.push({
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
          amount: order.totalPrice.centAmount,
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
        });
      });
    }

    this.logger.info(`Sending ${orders.length} orders to Voucherify`);

    const response = await Promise.all(
      orders.map(async (order) => {
        return await this.voucherifyClient.getClient().orders.create(order);
      }),
    );

    return orders.length === response.length
      ? { success: true }
      : { success: false };
  }
}
