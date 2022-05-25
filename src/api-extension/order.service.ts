import { Injectable } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { JsonLoggerService } from 'json-logger-service';

type SendedCoupons = {
  result: string;
  coupon: string;
};

@Injectable()
export class OrderService {
  private logger = new JsonLoggerService('NestServer');
  constructor(
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
  ) {}

  public async redeemVoucherifyCoupons(
    body,
  ): Promise<{ status: boolean; actions: object[] }> {
    const coupons: string[] = body.resource.obj.custom?.fields?.discount_codes;
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

    sendedCoupons.forEach((sendedCoupon) => {
      this.logger.log(
        `Coupon: ${sendedCoupon.coupon} - ${sendedCoupon.result}`,
      );
      if (sendedCoupon.result === 'SUCCESS') {
        usedCoupons.push(sendedCoupon.coupon);
      } else {
        notUsedCoupons.push(sendedCoupon.coupon);
      }
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
