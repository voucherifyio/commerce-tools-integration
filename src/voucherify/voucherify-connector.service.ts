import { performance } from 'perf_hooks';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  RedemptionsRedeemStackableParams,
  ValidationsValidateStackableParams,
  VoucherifyServerSide,
} from '@voucherify/sdk';
import { ConfigService } from '@nestjs/config';
import { Cart, Order } from '@commercetools/platform-sdk';
import {
  RequestJsonLogger,
  REQUEST_JSON_LOGGER,
} from '../misc/request-json-logger';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { Coupon } from '../integration/types';
import {
  CommercetoolsService,
  getCustomerFromOrder,
} from '../commercetools/commercetools.service';

function elapsedTime(start: number, end: number): string {
  return `Time: ${(end - start).toFixed(3)}ms`;
}

@Injectable()
export class VoucherifyConnectorService {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
    private commercetoolsService: CommercetoolsService,
    @Inject(REQUEST_JSON_LOGGER)
    private readonly requestJsonLogger: RequestJsonLogger,
  ) {}

  private readonly applicationId: string =
    this.configService.get<string>('VOUCHERIFY_APP_ID');
  private readonly secretKey: string = this.configService.get<string>(
    'VOUCHERIFY_SECRET_KEY',
  );

  getClient(): ReturnType<typeof VoucherifyServerSide> {
    const start = performance.now();
    const voucherify = VoucherifyServerSide({
      applicationId: this.applicationId,
      secretKey: this.secretKey,
    });
    const end = performance.now();
    this.logger.debug(`V% getClient creation: ${end - start}ms`);

    return voucherify;
  }

  async validateStackableVouchers(request) {
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
    order: Order, //CommerceTools Order
    items: OrdersItem[], //V% OrderItems
    orderMetadata: Record<string, any>,
  ) {
    const orderCreate = {
      source_id: order.id,
      amount: items.reduce((acc, item) => acc + item.amount, 0),
      discount_amount: 0,
      items,
      metadata: orderMetadata,
      customer: getCustomerFromOrder(order),
      status: (order.paymentState === 'Paid'
        ? 'PAID'
        : 'CREATED') as OrdersCreate['status'],
    };

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

  async releaseValidationSession(code: string, sessionKey: string) {
    await this.getClient().vouchers.releaseValidationSession(code, sessionKey);
  }

  async getMetadataSchemaProperties(resourceName: string): Promise<string[]> {
    const metadataSchemas = await this.getClient().metadataSchemas.list();
    const metadataSchema = metadataSchemas.schemas.find(
      (schema) => schema.related_object === resourceName,
    );
    return Object.keys(metadataSchema?.properties ?? {});
  }

  async getAvailablePromotions(cart, items) {
    const promotions = await this.getClient().promotions.validate({
      customer: {
        id: cart.customerId || cart.anonymousId,
        source_id: cart.customerId || cart.anonymousId,
      },
      order: {
        source_id: cart.id,
        items: items,
        amount: items.reduce((acc, item) => acc + item.amount, 0),
      },
    });

    if (promotions.valid) {
      return promotions.promotions;
    }

    return [];
  }
}
