import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { VoucherifyConnectorService } from './voucherify-connector.service';
import { ProductMapper } from '../integration/mappers/product';
import { ConfigService } from '@nestjs/config';
import { ValidationValidateStackableResponse } from '@voucherify/sdk';
import { Coupon } from '../integration/types';

@Injectable()
export class VoucherifyService {
  constructor(
    @Inject(forwardRef(() => VoucherifyConnectorService))
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly productMapper: ProductMapper,
    private readonly configService: ConfigService,
  ) {}

  public async getPromotions(cart, uniqCoupons: Coupon[]) {
    const disableCartPromotion =
      this.configService.get<string>('DISABLE_CART_PROMOTION') ?? 'false';

    if (disableCartPromotion.toLowerCase() === 'true') {
      return { promotions: [], availablePromotions: [] };
    }

    const promotions =
      await this.voucherifyConnectorService.getAvailablePromotions(
        cart,
        this.productMapper.mapLineItems(cart.lineItems),
      );

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
    validatedCoupons: ValidationValidateStackableResponse,
    promotions,
  ) {
    const promotionTiersWithBanner = validatedCoupons.redeemables
      .filter((redeemable) => redeemable.object === 'promotion_tier')
      .map((redeemable) => {
        const appliedPromotion = promotions.find(
          (promotion) => promotion.id === redeemable.id,
        );
        if (appliedPromotion) {
          redeemable['banner'] = appliedPromotion?.banner;
        }

        return redeemable;
      });

    validatedCoupons.redeemables = [
      ...validatedCoupons.redeemables.filter(
        (element) => element.object !== 'promotion_tier',
      ),
      ...promotionTiersWithBanner,
    ];
  }
}
