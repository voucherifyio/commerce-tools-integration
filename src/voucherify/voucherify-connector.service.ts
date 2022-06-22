import { Injectable } from '@nestjs/common';
import { VoucherifyServerSide } from '@voucherify/sdk';
import { ConfigService } from '@nestjs/config';
import { Cart, Order } from '@commercetools/platform-sdk';

const getAmount = (item) => {
  try {
    return item?.totalPrice?.centAmount;
  } catch (e) {
    return undefined;
  }
};

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
  constructor(private configService: ConfigService) {}

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

  async validateVoucherWithCTCart(coupon: string, cart: Cart) {
    return await this.getClient().validations.validateVoucher(coupon, {
      customer: {
        id: cart?.createdBy?.clientId,
      },
      order: {
        id: cart.id,
        amount:
          cart.lineItems
            .map((item) => getAmount(item))
            .filter((price) => price)
            .reduce((a, b) => a + b, 0) * 10,
        items: cart.lineItems.map((item) => {
          return {
            sku_id: item?.variant?.sku,
            product_id: item?.id,
            related_object: 'sku',
            quantity: item?.quantity,
            price: item?.variant.prices?.[0]?.value?.centAmount,
            amount: getAmount(item) * 10,
            product: {
              override: true,
              name: Object?.values(item.name)?.[0],
            },
            sku: {
              override: true,
              sku: item?.variant?.sku,
            },
          };
        }),
      },
    });
  }

  async validateStackableVouchersWithCTCart(
    coupons: string[],
    cart: Cart,
    sessionKey?: string | null,
  ) {
    return await this.getClient().validations.validateStackable({
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
        customer: {
          id: cart?.createdBy?.clientId,
        },
        amount: cart.taxedPrice.totalGross.centAmount,
        discount_amount: 0,
        items: cart.lineItems
          .filter((item) => getQuantity(item))
          .map((item) => {
            return {
              sku_id: item?.variant?.sku,
              source_id: item?.variant?.sku,
              product_id: item?.variant?.sku,
              related_object: 'sku',
              quantity: getQuantity(item),
              price: item.price.value.centAmount,
              amount: item.price.value.centAmount * getQuantity(item),
              product: {
                override: true,
                name: Object?.values(item.name)?.[0],
              },
              sku: {
                override: true,
                sku: item?.variant?.sku,
              },
            };
          }),
      },
      customer: {
        id: cart?.createdBy?.clientId,
      },
    });
  }

  async reedemStackableVouchers(
    coupons: string[],
    sessionKey: string,
    order: Order,
  ) {
    return this.getClient().redemptions.redeemStackable({
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
        amount: order.taxedPrice.totalGross.centAmount,
        discount_amount: 0,
        items: order.lineItems
          .filter((item) => getQuantity(item))
          .map((item) => {
            return {
              source_id: item?.variant?.sku,
              related_object: 'sku',
              quantity: getQuantity(item),
              price: item.price.value.centAmount,
              amount: item.price.value.centAmount * getQuantity(item),
              product: {
                override: true,
                name: Object?.values(item.name)?.[0],
              },
              sku: {
                override: true,
                sku: item?.variant?.sku,
              },
            };
          }),
      },
      customer: {
        source_id: order?.createdBy?.clientId,
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
    });
  }
}
