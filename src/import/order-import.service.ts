import { Injectable } from '@nestjs/common';
import { Order } from '@commercetools/platform-sdk';
import { CommerceToolsConnectorService } from '../commerceTools/commerce-tools-connector.service';
import { JsonLogger, LoggerFactory } from 'json-logger-service';

@Injectable()
export class OrderImport {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    OrderImport.name,
  );

  public async orderImport() {
    const orders = [];

    for await (const ordersBatch of this.getAllOrders()) {
      ordersBatch.forEach((order) => {
        orders.push({
          object: 'order',
          source_id: order.id,
          created_at: order.createdAt,
          updated_at: order.lastModifiedAt,
          customer: {
            object: 'customer',
            source_id: order.customerId || order.anonymousId,
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

    console.log(orders);
    // send to v%
  }

  private async *getAllOrders(): AsyncGenerator<Order[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    let page = 0;
    let allOrdersCollected = false;

    do {
      const ordersResult = await ctClient
        .orders()
        .get({ queryArgs: { limit: limit, offset: page * limit } })
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
}
