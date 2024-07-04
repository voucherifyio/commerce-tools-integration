import { Injectable } from '@nestjs/common';
import { VoucherifyConnectorService } from './voucherify-connector.service';
import { ConfigService } from '@nestjs/config';
import { Coupon } from '../integration/types';
import { StackableRedeemableResponse } from '@voucherify/sdk/dist/types/Stackable';

@Injectable()
export class VoucherifyService {
  constructor(
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly configService: ConfigService,
  ) {}

  public async getPromotions(cart, uniqCoupons: Coupon[]) {
    if (this.configService.get<string>('DISABLE_CART_PROMOTION') === 'true') {
      return { promotions: [], availablePromotions: [] };
    }

    const promotions =
      (await this.voucherifyConnectorService.getAvailablePromotions(cart)) ??
      [];

    const availablePromotions = promotions
      .filter((promo) => {
        if (!uniqCoupons.length) {
          return true;
        }

        const codes = uniqCoupons
          .filter((coupon) => coupon.status !== 'DELETED')
          .map((coupon) => coupon.code);
        return !codes.includes(promo.id);
      })
      .map((promo) => {
        return {
          status: 'AVAILABLE',
          value: promo.discount_amount,
          banner: promo.banner,
          code: promo.id,
          type: promo.object,
        };
      });

    return { promotions, availablePromotions };
  }

  public setBannerOnValidatedPromotions(
    redeemables: StackableRedeemableResponse[],
    promotions = [],
  ) {
    return redeemables.map((redeemable) => {
      if (redeemable.object !== 'promotion_tier') {
        return redeemable;
      }
      const appliedPromotion = promotions.find(
        (promotion) => promotion.id === redeemable.id,
      );
      if (appliedPromotion) {
        redeemable['banner'] = appliedPromotion?.banner;
      }
      return redeemable;
    });
  }
}
