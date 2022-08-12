import { Injectable, Logger } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { Order } from '@commercetools/platform-sdk';
import { desarializeCoupons, Coupon } from './coupon';
import { OrderMapper } from './mappers/order';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { ProductMapper } from './mappers/product';

type SentCoupons = {
  result: string;
  coupon: string;
};

@Injectable()
export class OrderService {
  constructor(
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly logger: Logger,
    private readonly orderMapper: OrderMapper,
    private readonly productMapper: ProductMapper,
  ) {}

  public async redeemVoucherifyCoupons(
    order: Order,
  ): Promise<{ status: boolean; actions: object[] }> {
    const coupons: Coupon[] = (order.custom?.fields?.discount_codes ?? []).map(
      desarializeCoupons,
    );
    const { id, customerId } = order;

    if (!coupons.length || order.paymentState !== 'Paid') {
      this.logger.debug({
        msg: 'No coupons provided or order is not paid',
        id,
        customerId,
      });
      return { status: true, actions: [] };
    }

    this.logger.debug({
      msg: 'Attempt to redeem vouchers',
      coupons,
      id,
      customerId,
    });
    const sentCoupons: SentCoupons[] = [];
    const usedCoupons: string[] = [];
    const notUsedCoupons: string[] = [];
    const orderMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'order',
      );

    const productMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'product',
      );

    const sessionKey = order.custom?.fields.session;

    const response =
      await this.voucherifyConnectorService.redeemStackableVouchers(
        coupons.map((coupon) => coupon.code),
        sessionKey,
        order,
        this.productMapper.mapLineItems(
          order.lineItems,
          productMetadataSchemaProperties,
        ),
        this.orderMapper.getMetadata(order, orderMetadataSchemaProperties),
      );

    sentCoupons.push(
      ...response.redemptions.map((redem) => {
        return {
          result: redem.result,
          coupon: redem.voucher.code,
        };
      }),
    );

    this.logger.debug({
      msg: 'Voucherify redeem response',
      id,
      customerId,
      redemptions: response?.redemptions,
    });

    sentCoupons.forEach((sendedCoupon) => {
      if (sendedCoupon.result === 'SUCCESS') {
        usedCoupons.push(sendedCoupon.coupon);
      } else {
        notUsedCoupons.push(sendedCoupon.coupon);
      }
    });

    order = this.assignCouponsToOrderMetadata(
      order,
      usedCoupons,
      notUsedCoupons,
    );

    await this.updateOrderMetadata(order, orderMetadataSchemaProperties);

    this.logger.debug({
      msg: 'Realized coupons',
      id,
      customerId,
      usedCoupons,
      notUsedCoupons,
    });
    const actions = [
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: notUsedCoupons,
      },
      {
        action: 'setCustomField',
        name: 'used_codes',
        value: usedCoupons,
      },
    ];

    return { status: true, actions: actions };
  }

  public assignCouponsToOrderMetadata(
    order: Order,
    usedCoupons,
    notUsedCoupons,
  ) {
    order.custom.fields['used_codes'] = usedCoupons;
    order.custom.fields['discount_codes'] = notUsedCoupons;

    return order;
  }

  public async updateOrderMetadata(order: Order, metadataSchemaProperties) {
    const ordersCreate = this.orderMapper.getOrderObject(order) as OrdersCreate;

    const metadata = this.orderMapper.getMetadata(
      order,
      metadataSchemaProperties,
    );

    await this.voucherifyConnectorService
      .getClient()
      .orders.create(
        Object.keys(metadata).length
          ? { ...ordersCreate, metadata: Object.fromEntries(metadata) }
          : ordersCreate,
      );
  }
}
