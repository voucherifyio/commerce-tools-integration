import { Cart } from '@commercetools/platform-sdk';
import {
  CartAction,
  CartActionAddCustomLineItem,
  CartActionRemoveCustomLineItem,
  COUPON_CUSTOM_LINE_SLUG,
} from '../CartAction';
import { ValidateCouponsResult } from '../../types';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// TODO don't create addCustomLineItem action if the summary doesn't actually change
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

function removeDiscountedCustomLineItems(
  cart: Cart,
): CartActionRemoveCustomLineItem[] {
  return (cart.customLineItems || [])
    .filter((lineItem) => lineItem.slug.startsWith(COUPON_CUSTOM_LINE_SLUG))
    .map(
      (lineItem) =>
        ({
          action: 'removeCustomLineItem',
          customLineItemId: lineItem.id,
        } as CartActionRemoveCustomLineItem),
    );
}

export default function customLineItems(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const cartActions = [] as CartAction[];

  cartActions.push(
    ...addCustomLineItemWithDiscountSummary(cart, validateCouponsResult),
    ...removeDiscountedCustomLineItems(cart),
  );

  return cartActions;
}
