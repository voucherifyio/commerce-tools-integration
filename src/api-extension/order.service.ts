import { Injectable } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { Order } from '@commercetools/platform-sdk';
import { desarializeCoupons, Coupon } from './coupon';

type SendedCoupons = {
  result: string;
  coupon: string;
};

@Injectable()
export class OrderService {
  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    OrderService.name,
  );
  constructor(
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
  ) {}

  public async redeemVoucherifyCoupons(
    order: Order,
  ): Promise<{ status: boolean; actions: object[] }> {
    const coupons: Coupon[] = (order.custom?.fields?.discount_codes ?? []).map(
      desarializeCoupons,
    );

    const { id, customerId } = order;

    if (!coupons.length || order.paymentState !== 'Paid') {
      this.logger.info({
        msg: 'No coupons provided or order is not paid',
        id,
        customerId,
      });
      return { status: true, actions: [] };
    }

    this.logger.info({
      msg: 'Attempt to redeem vouchers',
      coupons,
      id,
      customerId,
    });
    const sendedCoupons: SendedCoupons[] = [];
    const usedCoupons: string[] = [];
    const notUsedCoupons: string[] = [];

    const sessionKey = order.custom?.fields.session;

    const response =
      await this.voucherifyConnectorService.reedemStackableVouchers(
        coupons.map((coupon) => coupon.code),
        sessionKey,
      );
    sendedCoupons.push(
      ...response.redemptions.map((redem) => {
        return {
          result: redem.result,
          coupon: redem.voucher.code,
        };
      }),
    );

    this.logger.info({
      msg: 'Voucherify redeem response',
      id,
      customerId,
      redemptions: response?.redemptions,
    });

    sendedCoupons.forEach((sendedCoupon) => {
      if (sendedCoupon.result === 'SUCCESS') {
        usedCoupons.push(sendedCoupon.coupon);
      } else {
        notUsedCoupons.push(sendedCoupon.coupon);
      }
    });
    this.logger.info({
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
}
