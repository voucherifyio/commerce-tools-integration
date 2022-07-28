import { Injectable, Logger } from '@nestjs/common';
import { Order } from '@commercetools/platform-sdk';
import { CommerceToolsConnectorService } from '../commerceTools/commerce-tools-connector.service';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch2';

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
@Injectable()
export class OrderImportService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly voucherifyClient: VoucherifyConnectorService,
  ) {}

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
      this.logger.debug({
        msg: 'iterating over all orders',
        orders: limit * page,
        total: ordersResult.body.total,
      });
    } while (!allOrdersCollected);
  }

  public async migrateOrders(period?: number) {
    const meatdataSchemas = await this.voucherifyClient.getClient().metadataSchemas.list()
    const metadataSchema = meatdataSchemas.schemas.find(schema => schema.related_object === 'order')
    const metadataSchemaProperties = Object.keys(metadataSchema.properties)
    const orders = [];

    for await (const ordersBatch of this.getAllOrders(period)) {
      ordersBatch.forEach((order) => {
        if (order.paymentState !== 'Paid') {
          return;
        }
        const tmp = Object.keys(order.custom?.fields ? order.custom?.fields : {})
          .filter(customField => metadataSchemaProperties.includes(customField))
          .map(customField => {
            return [[customField], order.custom?.fields[customField]]
          }
        )
        if(Object.keys(tmp).length){
          console.log('tmp obj',tmp,Object.fromEntries(tmp))
        }

        const orderObj = {
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
          })
        }

        orders.push(Object.keys(tmp).length ? {...orderObj, metadata : Object.fromEntries(tmp)} : orderObj);
      });
    }

    this.logger.debug(`Sending ${orders.length} orders to Voucherify`);

    const url = `${this.configService.get<string>(
      'VOUCHERIFY_API_URL',
    )}/v1/orders`;
    const headers = {
      Accept: '*/*',
      'X-App-Id': this.configService.get<string>('VOUCHERIFY_APP_ID'),
      'X-App-Token': this.configService.get<string>('VOUCHERIFY_SECRET_KEY'),
      'content-type': 'application/json',
    };

    do {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orders.pop()),
      });

      if ((await response.json()).code === 400) {
        return { success: false };
      }

      const limit = response.headers.get('x-rate-limit-limit');
      const remaining = response.headers.get('x-rate-limit-remaining');

      if (!remaining) {
        const retryAfter = response.headers.get('Retry-After');
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
