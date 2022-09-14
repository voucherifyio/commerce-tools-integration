import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import {
  CartActionAddCustomLineItem,
  COUPON_CUSTOM_LINE_SLUG,
} from './CartAction';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export default // TODO don't create addCustomLineItem action if the summary doesn't actually change
function addCustomLineItemWithDiscountSummary(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionAddCustomLineItem[] {
  const logger = new Logger();
  const configService = new ConfigService();
  let couponText = {};
  try {
    couponText = JSON.parse(
      configService.get<string>('COMMERCE_TOOLS_COUPON_NAMES'),
    );
  } catch {
    logger.log(
      `Can't parse "COMMERCE_TOOLS_COUPON_NAME" environmental variable. Possibly it's not a valid stringified object. Providing default value.`,
    );
    couponText = {
      en: 'Coupon codes discount',
      de: 'Gutscheincodes rabatt',
    };
  }
  const { totalDiscountAmount, applicableCoupons, taxCategory } =
    validateCouponsResult;

  if (applicableCoupons.length === 0) return [];
  const { currencyCode } = cart.totalPrice;

  return [
    {
      action: 'addCustomLineItem',
      name: couponText,
      quantity: 1,
      money: {
        centAmount: totalDiscountAmount ? -totalDiscountAmount : 0,
        type: 'centPrecision',
        currencyCode,
      },
      slug: COUPON_CUSTOM_LINE_SLUG,
      taxCategory: {
        id: taxCategory.id,
      },
    } as CartActionAddCustomLineItem,
  ];
}
