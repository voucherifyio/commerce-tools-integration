import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import {
  CartActionAddCustomLineItem,
  COUPON_CUSTOM_LINE_SLUG,
} from './CartAction';
import { ConfigService } from '@nestjs/config';

export default // TODO don't create addCustomLineItem action if the summary doesn't actually change
function addCustomLineItemWithDiscountSummary(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionAddCustomLineItem[] {
  const configService = new ConfigService();
  const couponText = JSON.parse(
    configService.get<string>('COMMERCE_TOOLS_COUPON_NAMES'),
  );
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
