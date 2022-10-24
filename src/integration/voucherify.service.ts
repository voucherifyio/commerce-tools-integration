import { performance } from 'perf_hooks';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  RedemptionsRedeemStackableParams,
  ValidationsValidateStackableParams,
  VoucherifyServerSide,
} from '@voucherify/sdk';
import { ConfigService } from '@nestjs/config';
import { Cart } from './store/store.interface';
import {
  RequestJsonLogger,
  REQUEST_JSON_LOGGER,
} from '../misc/request-json-logger';
import { Coupon } from './store/store.interface';
import { OrdersCreate } from '@voucherify/sdk';
import { Order, PaymentState } from '@commercetools/platform-sdk';

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

  async validateStackableVouchersWithCTCart(cart: Cart) {
    const redeemables = cart.coupons
      .filter((coupon) => coupon.status !== 'DELETED')
      .map((code) => {
        return {
          object: code.type ? code.type : 'voucher',
          id: code.code,
        };
      });

    const sourceId = cart?.metadata?.customerId || cart?.metadata?.anonymousId;

    const request = {
      // options?: StackableOptions;
      redeemables,
      session: {
        type: 'LOCK',
        ...(cart.session && { key: cart.session }),
      },
      order: {
        source_id: cart?.metadata?.id || '',
        customer: {
          source_id: sourceId,
        },
        amount: cart.items.reduce((acc, item) => acc + item.amount, 0),
        discount_amount: 0,
        items: cart.items,
      },
      customer: {
        source_id: sourceId,
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
      customer: this.getCustomerFromOrder(order),
      status: (order.paymentState === 'Paid'
        ? 'PAID'
        : 'CREATED') as OrdersCreate['status'],
    };

    await this.getClient().orders.create(orderCreate);
  }

  async redeemStackableVouchers(
    coupons: Coupon[],
    sessionKey: string,
    order: Order,
    items: OrdersItem[],
    orderMetadata: Record<string, any>,
  ) {
    const redeemables = coupons.map((code) => {
      return {
        object: code.type ? code.type : 'voucher',
        id: code.code,
      };
    });

    const request = {
      session: {
        type: 'LOCK',
        key: sessionKey,
      },
      redeemables: redeemables,
      order: {
        source_id: order.id,
        amount: items.reduce((acc, item) => acc + item.amount, 0),
        status: 'PAID',
        items,
        metadata: orderMetadata,
      },
      customer: this.getCustomerFromOrder(order),
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

  private getCustomerFromOrder(order: Order) {
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
