import { Injectable } from '@nestjs/common';
import { CommercetoolsService } from './store/commercetools/commercetools.service';
import { Coupon, Cart } from './store/store.interface';
import { ConfigService } from '@nestjs/config';
import { VoucherifyConnectorService } from './voucherify.service';
import {ValidationValidateStackableResponse} from '@voucherify/sdk'

@Injectable()
export class IntegrationService {
  constructor(
    private store: CommercetoolsService,
    private readonly configService: ConfigService,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
  ) {
    store.onCartUpdate(async (cart, cartActions) => {
      const { promotions, availablePromotions } = await this.getPromotions(cart)


      const deletedCoupons = cart.coupons.filter(
        (coupon) => coupon.status === 'DELETED',
      );

      deletedCoupons
        .filter((coupon) => coupon.type !== 'promotion_tier')
        .forEach((coupon) =>
          this.voucherifyConnectorService.releaseValidationSession(
            coupon.code,
            cart.session,
          ),
        );

      const noCouponsToValidate = !cart.coupons.filter(
        (coupon) => coupon.status !== 'DELETED',
      ).length;

      const validatedCoupons =  noCouponsToValidate ? {
        valid: true,
        redeemables: []
      } as ValidationValidateStackableResponse: await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(cart);

      const getCouponsByStatus = (status) =>
        validatedCoupons.redeemables.filter(
          (redeemable) => redeemable.status === status,
        );

      const notApplicableCoupons = getCouponsByStatus('INAPPLICABLE');
      const skippedCoupons = getCouponsByStatus('SKIPPED');
      const applicableCoupons = getCouponsByStatus('APPLICABLE');
      const totalDiscountAmount = this.calculateTotalDiscountAmount(validatedCoupons);

      // todo 
      // - productsToAdd
      // - products to change
      // - revalidateCouponsBecauseNewUnitTypeCouponHaveAppliedWithWrongPrice
      // - banner
      // - calculateTotalDiscountAmount
      // - checkIfOnlyNewCouponsFailed
      // - checkIfAllInapplicableCouponsArePromotionTier
      
      // - cartActions builder

      // isValidAndNewCouponNotFailed
      if(validatedCoupons.valid){
        cartActions.setCartDiscount(totalDiscountAmount) // todo + !onlyNewCouponsFailed
      }

      // lineItemsAndTheirCustomFields

      // setSessionAsCustomField
      // updateDiscountsCodes

      // isValidAndNewCouponNotFailed
      // addShippingProductSourceIds 
      // setCouponsLimit

      return Promise.resolve(true);
    });
  }

  private calculateTotalDiscountAmount(
    validatedCoupons: ValidationValidateStackableResponse,
  ) {
    let totalDiscountAmount = 0;
    if (
      validatedCoupons.redeemables.find(
        (redeemable) => redeemable?.order?.items?.length,
      )
    ) {
      //Voucherify "order.total_applied_discount_amount" is not always calculated correctly,
      //so we need to iterate through the items to calculated discounted amount
      validatedCoupons.redeemables.forEach((redeemable) => {
        redeemable.order.items.forEach((item) => {
          if ((item as any).total_applied_discount_amount) {
            totalDiscountAmount += (item as any).total_applied_discount_amount;
          } else if ((item as any).total_discount_amount) {
            totalDiscountAmount += (item as any).total_discount_amount;
          }
        });
      });
    }
  
    if (totalDiscountAmount === 0) {
      return (
        validatedCoupons.order?.total_applied_discount_amount ??
        validatedCoupons.order?.total_discount_amount ??
        0
      );
    }
  
    if (totalDiscountAmount > (validatedCoupons?.order?.amount ?? 0)) {
      return validatedCoupons.order.amount;
    }
    return totalDiscountAmount;
  }


  private async getPromotions(cart: Cart) {
    const disableCartPromotion =
      this.configService.get<string>('DISABLE_CART_PROMOTION') ?? 'false';

    if (disableCartPromotion.toLowerCase() === 'true') {
      return { promotions: [], availablePromotions: [] };
    }

    const promotions =
      await this.voucherifyConnectorService.getAvailablePromotions(
        cart,
        cart.items,
      );

    const availablePromotions = promotions
      .filter((promo) => {
        if (!cart.coupons.length) {
          return true;
        }
        const codes = cart.coupons
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
}
