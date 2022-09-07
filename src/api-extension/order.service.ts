import { Injectable, Logger } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { Order } from '@commercetools/platform-sdk';
import { desarializeCoupons, Coupon } from './coupon';
import { OrderMapper } from './mappers/order';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { ProductMapper } from './mappers/product';
import {
  RedemptionsRedeemStackableOrderResponse,
  RedemptionsRedeemStackableRedemptionResult,
  RedemptionsRedeemStackableResponse,
  SimpleCustomer,
} from '@voucherify/sdk';
import { CommerceToolsConnectorService } from '../commerceTools/commerce-tools-connector.service';

type SentCoupons = {
  result: string;
  coupon: string;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms)).then((e) => null);
};

@Injectable()
export class OrderService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly logger: Logger,
    private readonly orderMapper: OrderMapper,
    private readonly productMapper: ProductMapper,
  ) {}

  public async redeemVoucherifyCoupons(order: Order): Promise<{
    redemptions?: RedemptionsRedeemStackableRedemptionResult[];
    actions: { name: string; action: string; value: string[] }[];
    status: boolean;
  }> {
    const coupons: Coupon[] = (order.custom?.fields?.discount_codes ?? [])
      .map(desarializeCoupons)
      .filter(
        (coupon) =>
          coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
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
    let response: RedemptionsRedeemStackableResponse;
    try {
      response = await this.voucherifyConnectorService.redeemStackableVouchers(
        coupons,
        sessionKey,
        order,
        this.productMapper.mapLineItems(
          order.lineItems,
          productMetadataSchemaProperties,
        ),
        this.orderMapper.getMetadata(order, orderMetadataSchemaProperties),
      );
    } catch (e) {
      this.logger.debug({ msg: 'Reedeem operation failed', error: e.details });
      return { status: true, actions: [] };
    }

    sentCoupons.push(
      ...response.redemptions.map((redem) => {
        return {
          result: redem.result,
          coupon: redem.voucher?.code
            ? redem.voucher.code
            : redem['promotion_tier']['id'],
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

    return {
      status: true,
      actions: actions,
      redemptions: response?.redemptions,
    };
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

  async checkPaidOrderFallback(
    orderId: string,
    redemptions: RedemptionsRedeemStackableRedemptionResult[],
  ) {
    let paid = false;
    for (let i = 0; i < 2; i++) {
      await sleep(500);
      const order = await this.commerceToolsConnectorService.findOrder(orderId);
      if (order.paymentState === 'Paid') {
        paid = true;
        break;
      }
    }
    if (paid) {
      return;
    }
    await this.voucherifyConnectorService.rollbackRedemptions(redemptions);
  }
}
