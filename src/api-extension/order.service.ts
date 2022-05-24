import { Injectable } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';

type RealisedCoupons = {
  result: string;
  coupon: string;
};

@Injectable()
export class OrderService {
  constructor(
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
  ) {}

  public async redeemVoucherifyCoupons(
    body,
  ): Promise<{ status: boolean; actions: object[] }> {
    const coupons: string[] | null =
      body.resource.obj.custom?.fields?.discount_codes &&
      body.resource.obj.custom?.fields?.discount_codes.length
        ? body.resource.obj.custom?.fields?.discount_codes
        : null;
    const realisedCoupons: RealisedCoupons[] = [];
    const unusedCoupons: string[] = [];

    if (body.resource.obj.paymentState === 'Paid' && coupons) {
      const response =
        await this.voucherifyConnectorService.reedemStackableVouchers(coupons);
      realisedCoupons.push(
        ...response.redemptions.map((redem) => {
          return {
            result: redem.result,
            coupon: redem.voucher.code,
          };
        }),
      );

      realisedCoupons.forEach((realised) => {
        if (realised.result !== 'SUCCESS') {
          unusedCoupons.push(realised.coupon);
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
    } else {
      return { status: true, actions: [] };
    }
  }
}
