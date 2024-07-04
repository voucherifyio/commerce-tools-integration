import { Injectable, Logger } from '@nestjs/common';
import { Order } from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { OrderMapper } from '../integration/utils/mappers/order';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { getSimpleMetadataForOrder } from '../commercetools/utils/mappers/getSimpleMetadataForOrder';
import { OrderPaidActions } from '../commercetools/store-actions/order-paid-actions';
import { mergeTwoObjectsIntoOne } from '../integration/utils/mergeTwoObjectsIntoOne';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

@Injectable()
export class OrderImportService {
  constructor(
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly logger: Logger,
    private readonly voucherifyClient: VoucherifyConnectorService,
    private readonly orderMapper: OrderMapper,
    private readonly commercetoolsService: CommercetoolsService,
  ) {}

  public async *getPartialOrders(
    minDateTime?: string,
  ): AsyncGenerator<Order[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    let page = 0;
    let allOrdersCollected = false;

    do {
      const ordersResult = await ctClient
        .orders()
        .get({
          queryArgs: {
            limit: limit,
            offset: page * limit,
            ...(minDateTime && {
              where: `lastModifiedAt>="${minDateTime}" or createdAt>="${minDateTime}"`,
            }),
          },
        })
        .execute()
        .catch((result) => result);
      yield ordersResult.body.results;
      page++;
      if (ordersResult.body.total < page * limit) {
        allOrdersCollected = true;
      }
      console.log(
        {
          msg: 'iterating over all orders',
          orders: limit * page,
          total: ordersResult.body.total,
        },
        '\n',
      );
    } while (!allOrdersCollected);
  }

  private async getAllOrders(period?: string) {
    const orders = [];
    const orderMetadataSchemaProperties =
      await this.voucherifyClient.getMetadataSchemaProperties('order');

    const orderActions = new OrderPaidActions();
    orderActions.setCtClient(this.commerceToolsConnectorService.getClient());

    for await (const ordersBatch of this.getPartialOrders(period)) {
      for (const order of ordersBatch) {
        if (order.paymentState !== 'Paid') {
          continue;
        }

        const metadata = mergeTwoObjectsIntoOne(
          (await orderActions.getCustomMetadataForOrder?.(
            order,
            orderMetadataSchemaProperties,
          )) || {},
          getSimpleMetadataForOrder(order, orderMetadataSchemaProperties),
        );

        const orderObj = this.orderMapper.getOrderObject(order);

        orders.push(
          Object.keys(metadata).length ? { ...orderObj, metadata } : orderObj,
        );
      }
    }
    return orders;
  }

  public async migrateOrders(period?: string) {
    const orders = await this.getAllOrders(period);
    console.log(`Sending ${orders.length} orders to Voucherify\n`);

    const client = this.voucherifyClient.getClient();
    do {
      client.orders.create(orders.pop());

      const apiLimitHandler = client.apiLimitsHandler.areLimitsAvailable();

      const limit = apiLimitHandler
        ? client.apiLimitsHandler.getRateLimit()
        : 0;
      const remaining = apiLimitHandler
        ? client.apiLimitsHandler.getRateLimitRemaining()
        : 0;

      if (!remaining) {
        const retryAfter = apiLimitHandler
          ? client.apiLimitsHandler.getRetryAfter()
          : 0;
        console.log(
          `You are out of api calls. Program will be awaken in ${
            retryAfter * 1000
          } seconds\n`,
        );
        await sleep(retryAfter * 1000);
        continue;
      }
      console.log(
        `The number of api calls is reduced due to Voucherify API request limit of ${limit}/h. Next call in ${
          (60 * 60 * 1000) / limit
        }ms. Number of remaining requests in this hour is: ${remaining}. Number of needed api calls to migrate all orders is: ${
          orders.length
        }`,
        '\n',
      );
      await sleep((60 * 60 * 1000) / limit);
    } while (orders.length);

    return { success: true };
  }
}
