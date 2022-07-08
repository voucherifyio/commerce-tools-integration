import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class VoucherifyConnectorService {
  constructor(
    private configService: ConfigService,
    @Inject(REQUEST_JSON_LOGGER)
    private readonly requestJsonLogger: RequestJsonLogger,
  ) {}

  private readonly applicationId: string =
    this.configService.get<string>('VOUCHERIFY_APP_ID');
  private readonly secretKey: string = this.configService.get<string>(
    'VOUCHERIFY_SECRET_KEY',
  );

  getClient(): ReturnType<typeof VoucherifyServerSide> {
    return VoucherifyServerSide({
      applicationId: this.applicationId,
      secretKey: this.secretKey,
    });
  }

  async validateStackableVouchersWithCTCart(
    coupons: string[],
    cart: Cart,
    sessionKey?: string | null,
  ) {
    const items = cart.lineItems
      .filter((item) => getQuantity(item))
      .map((item) => {
        return {
          source_id: item?.variant?.sku,
          related_object: 'sku' as 'sku' | 'product',
          quantity: getQuantity(item),
          price: item.price.value.centAmount,
          amount: item.price.value.centAmount * getQuantity(item),
          product: {
            override: true,
            name: Object?.values(item.name)?.[0],
          },
          sku: {
            override: true,
            sku: Object?.values(item.name)?.[0],
          },
        };
      });

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

    const response = await this.getClient().validations.validateStackable(
      request,
    );

    await this.requestJsonLogger.log(
      'voucherify-client-validate-stackable',
      request,
      response,
    );

    return response;
  }

  async reedemStackableVouchers(
    coupons: string[],
    sessionKey: string,
    order: Order,
  ) {
    const items = order.lineItems
      .filter((item) => getQuantity(item))
      .map((item) => {
        return {
          source_id: item?.variant?.sku,
          related_object: 'sku' as 'sku' | 'product',
          quantity: getQuantity(item),
          price: item.price.value.centAmount,
          amount: item.price.value.centAmount * getQuantity(item),
          product: {
            override: true,
            name: Object?.values(item.name)?.[0],
          },
          sku: {
            override: true,
            sku: Object?.values(item.name)?.[0],
          },
        };
      });

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

    const response = await this.getClient().redemptions.redeemStackable(
      request,
    );

    await this.requestJsonLogger.log(
      'voucherify-client-redeem-stackable',
      request,
      response,
    );

    return response;
  }
}
