import { Injectable } from '@nestjs/common';
import { VoucherifyServerSide } from '@voucherify/sdk';
import { ConfigService } from '@nestjs/config';
import { Cart } from '@commercetools/platform-sdk';

const getAmount = (item) => {
  try {
    return item?.variant?.prices?.[0]?.value?.centAmount * item.quantity;
  } catch (e) {
    return undefined;
  }
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

  async validateStackableVouchersWithCTCart(coupons: string[], cart: Cart) {
    return await this.getClient().validations.validateStackable({
      // options?: StackableOptions;
      redeemables: coupons.map((coupon) => {
        return {
          object: 'voucher',
          id: coupon,
        };
      }),
      // session?: ValidationSessionParams;
      order: {
        customer: {
          id: cart?.createdBy?.clientId,
        },
        amount: cart.lineItems
          .map((item) => getAmount(item))
          .filter((price) => price)
          .reduce((a, b) => a + b, 0),
        discount_amount: 0,
        items: cart.lineItems.map((item) => {
          return {
            sku_id: item?.variant?.sku,
            product_id: item?.id,
            related_object: 'sku',
            quantity: item?.quantity,
            price: item?.variant.prices?.[0]?.value?.centAmount,
            amount: getAmount(item),
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
}
