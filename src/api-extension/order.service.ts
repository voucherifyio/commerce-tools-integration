import { Injectable } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
// import { JsonLoggerService } from 'json-logger-service';

type SendedCoupons = {
  result: string;
  coupon: string;
};

@Injectable()
export class OrderService {
  constructor(
    private readonly voucherifyConnectorService: VoucherifyConnectorService, // private logger: JsonLoggerService,
  ) {}

  public async redeemVoucherifyCoupons(
    body,
  ): Promise<{ status: boolean; actions: object[] }> {
    const coupons: string[] = body.resource.obj.custom?.fields?.discount_codes;
    const sendedCoupons: SendedCoupons[] = [];
    const unusedCoupons: string[] = [];

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
      if (sendedCoupon.result !== 'SUCCESS') {
        unusedCoupons.push(sendedCoupon.coupon);
      }
    });

    const actions = [
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: unusedCoupons,
      },
    ];

    return { status: true, actions: actions };
  }
}
