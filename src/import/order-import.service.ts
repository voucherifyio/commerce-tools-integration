import { Injectable, Logger } from '@nestjs/common';
import { Order } from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { OrderMapper } from '../integration/utils/mappers/order';
import { CommercetoolsService } from '../commercetools/commercetools.service';

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

  public async *getAllOrders(minDateTime?: string): AsyncGenerator<Order[]> {
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
        .execute();
      yield ordersResult.body.results;
      page++;
      if (ordersResult.body.total < page * limit) {
        allOrdersCollected = true;
      }
      this.logger.debug({
        msg: 'iterating over all orders',
        orders: limit * page,
        total: ordersResult.body.total,
      });
    } while (!allOrdersCollected);
  }

  public async migrateOrders(period?: string) {
    const orders = [];
    const metadataSchemaProperties =
      await this.voucherifyClient.getMetadataSchemaProperties('order');

    for await (const ordersBatch of this.getAllOrders(period)) {
      for (const order of ordersBatch) {
        if (order.paymentState !== 'Paid') {
          continue;
        }

        const metadata = await this.commercetoolsService.getMetadataForOrder(
          order,
          metadataSchemaProperties,
        );
        const orderObj = this.orderMapper.getOrderObject(order);

        orders.push(
          Object.keys(metadata).length ? { ...orderObj, metadata } : orderObj,
        );
      }
    }

    this.logger.debug(`Sending ${orders.length} orders to Voucherify`);

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
        this.logger.debug(
          `You are out of api calls. Program will be awaken in ${
            retryAfter * 1000
          } seconds`,
        );
        await sleep(retryAfter * 1000);
        continue;
      }
      this.logger.debug(
        `The number of api calls is reduced due to Voucherify API request limit of ${limit}/h. Next call in ${
          (60 * 60 * 1000) / limit
        }ms. Number of remaining requests in this hour is: ${remaining}. Number of needed api calls to migrate all orders is: ${
          orders.length
        }`,
      );
      await sleep((60 * 60 * 1000) / limit);
    } while (orders.length);

    return { success: true };
  }
}
