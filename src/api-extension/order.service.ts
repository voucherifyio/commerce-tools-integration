import { Injectable } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { Order } from '@commercetools/platform-sdk';
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
    const coupons: string[] = Array.isArray(
      order.custom?.fields?.discount_codes,
    )
      ? order.custom.fields.discount_codes
      : [];

    if (!coupons.length) {
      this.logger.info({ msg: 'No cuopuns provided' });
      return { status: true, actions: [] };
    }

    this.logger.info({ msg: 'Attempt to redeem vouchers', coupons });
    const sendedCoupons: SendedCoupons[] = [];
    const usedCoupons: string[] = [];
    const notUsedCoupons: string[] = [];

    const response =
      await this.voucherifyConnectorService.reedemStackableVouchers(coupons);
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
