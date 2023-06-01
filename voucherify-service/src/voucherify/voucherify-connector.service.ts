import { performance } from 'perf_hooks';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  RedemptionsRedeemStackableParams,
  ValidationsValidateStackableParams,
  VoucherifyServerSide,
} from '@voucherify/sdk';
import { ConfigService } from '@nestjs/config';
import {
  RequestJsonLoggerInterface,
  REQUEST_JSON_LOGGER,
} from '../misc/request-json-logger-interface';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { mapItemsToVoucherifyOrdersItems } from '../integration/utils/mappers/product';
import { Order } from '../integration/types';
import { elapsedTime } from '../misc/elapsedTime';

@Injectable()
export class VoucherifyConnectorService {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
    @Inject(REQUEST_JSON_LOGGER)
    private readonly requestJsonLogger: RequestJsonLoggerInterface,
  ) {}

  private readonly applicationId: string =
    this.configService.get<string>('VOUCHERIFY_APP_ID');
  private readonly secretKey: string = this.configService.get<string>(
    'VOUCHERIFY_SECRET_KEY',
  );
  private readonly apiUrl: string =
    this.configService.get<string>('VOUCHERIFY_API_URL');

  getClient(): ReturnType<typeof VoucherifyServerSide> {
    const start = performance.now();
    const voucherify = VoucherifyServerSide({
      applicationId: this.applicationId,
      secretKey: this.secretKey,
      apiUrl: this.apiUrl,
    });
    const end = performance.now();
    this.logger.debug(`V% getClient creation: ${end - start}ms`);

    return voucherify;
  }

  async validateStackableVouchers(request: ValidationsValidateStackableParams) {
    const start = performance.now();
    const response = await this.getClient().validations.validateStackable(
      request,
    );
    const end = performance.now();

    this.logger.debug(`Validate: ${elapsedTime(start, end)}`);
    await this.requestJsonLogger.log(
      'voucherify-client-validate-stackable',
      request,
      response,
      {
        elapsedTime: elapsedTime(start, end),
      },
    );

    return response;
  }

  async createOrder(
    order: Order, //Integration Order
    items: OrdersItem[],
    orderMetadata: Record<string, any>,
  ) {
    const orderCreate = {
      source_id: order.id,
      amount: order.items.reduce((acc, item) => acc + item.amount, 0),
      discount_amount: 0,
      items,
      metadata: orderMetadata,
      customer: order.customer,
      status: order.status,
    } as OrdersCreate;

    await this.getClient().orders.create(orderCreate);
  }

  async redeemStackableVouchers(request: RedemptionsRedeemStackableParams) {
    const start = performance.now();

    const response = await this.getClient().redemptions.redeemStackable(
      request,
    );
    const end = performance.now();
    this.logger.debug(`Redeem: ${elapsedTime(start, end)}`);

    await this.requestJsonLogger.log(
      'voucherify-client-redeem-stackable',
      request,
      response,
      {
        elapsedTime: elapsedTime(start, end),
      },
    );
    return response;
  }

  async releaseValidationSession(codes: string[], sessionKey: string) {
    for await (const code of codes) {
      await this.getClient().vouchers.releaseValidationSession(
        code,
        sessionKey,
      );
    }
  }

  async getMetadataSchemaProperties(resourceName: string): Promise<string[]> {
    const metadataSchemas = await this.getClient().metadataSchemas.list();
    const metadataSchema = metadataSchemas.schemas.find(
      (schema) => schema.related_object === resourceName,
    );
    return Object.keys(metadataSchema?.properties ?? {});
  }

  async getAvailablePromotions(cart) {
    const items = mapItemsToVoucherifyOrdersItems(cart.items);
    const promotions = await this.getClient().promotions.validate({
      customer: {
        id: cart.customerId || cart.anonymousId,
        source_id: cart.customerId || cart.anonymousId,
      },
      order: {
        source_id: cart.id,
        items,
        amount: items.reduce((acc, item) => acc + item.amount, 0),
      },
    });

    if (promotions.valid) {
      return promotions.promotions;
    }

    return [];
  }
}
