import { performance } from 'perf_hooks';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
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

const getQuantity = (item) => {
  const custom = item.custom?.fields?.applied_codes;
  let itemQuantity = item?.quantity;

  if (custom) {
    custom
      .map((code) => JSON.parse(code))
      .filter((code) => code.type === 'UNIT')
      .forEach((code) => (itemQuantity = itemQuantity - code.quantity));
  }
  return itemQuantity;
};

function elapsedTime(start: number, end: number): string {
  return `Time: ${(end - start).toFixed(3)}ms`;
}

@Injectable()
export class VoucherifyConnectorService {
  constructor(
    private configService: ConfigService,
    private logger: Logger,
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

  async validateStackableVouchersWithCTCart(
    coupons: string[],
    cart: Cart,
    items,
    sessionKey?: string | null,
  ) {
    const request = {
      // options?: StackableOptions;
      redeemables: coupons.map((coupon) => {
        return {
          object: 'voucher',
          id: coupon,
        };
      }),
      session: {
        type: 'LOCK',
        ...(sessionKey && { key: sessionKey }),
      },
      order: {
        source_id: cart.id,
        customer: {
          source_id: cart.customerId || cart.anonymousId,
        },
        amount: items.reduce((acc, item) => acc + item.amount, 0),
        discount_amount: 0,
        items,
      },
      customer: {
        source_id: cart.customerId || cart.anonymousId,
      },
    } as ValidationsValidateStackableParams;

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

  async reedemStackableVouchers(
    coupons: string[],
    sessionKey: string,
    order: Order,
    items,
    orderMetadata,
  ) {
    console.log(items);
    console.log(666, items[0].product.metadata);
    const request = {
      session: {
        type: 'LOCK',
        key: sessionKey,
      },
      redeemables: coupons.map((coupon) => {
        return {
          object: 'voucher',
          id: coupon,
        };
      }),
      order: {
        source_id: order.id,
        amount: items.reduce((acc, item) => acc + item.amount, 0),
        discount_amount: 0,
        items,
        metadata: Object.fromEntries(orderMetadata),
      },
      customer: {
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
    } as RedemptionsRedeemStackableParams;

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
}
