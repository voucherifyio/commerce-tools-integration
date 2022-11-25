import { Cart, TaxCategory } from '@commercetools/platform-sdk';
import {
  CartAction,
  CartActionAddCustomLineItem,
  CartActionRemoveCustomLineItem,
  COUPON_CUSTOM_LINE_SLUG,
  DataToRunCartActionsBuilder,
} from '../CartAction';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import addDirectDiscountWithDiscountSummary from '../addDirectDiscountWithDiscountSummary';
import { CartDiscountApplyMode } from '../../../types';

// TODO don't create addCustomLineItem action if the summary doesn't actually change
function addCustomLineItemWithDiscountSummary(
  cart: Cart,
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
  taxCategory: TaxCategory,
): CartActionAddCustomLineItem[] {
  const voucherCustomLineItem = cart.customLineItems
    .filter((lineItem) => !lineItem.slug.startsWith(COUPON_CUSTOM_LINE_SLUG))
    .find((customLineItem) => customLineItem?.slug === COUPON_CUSTOM_LINE_SLUG);
  if (voucherCustomLineItem) return [];

  const { totalDiscountAmount, applicableCoupons } =
    dataToRunCartActionsBuilder;

  if (applicableCoupons.length === 0) return [];

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
    .map((lineItem) => {
      return {
        action: 'removeCustomLineItem',
        customLineItemId: lineItem.id,
      } as CartActionRemoveCustomLineItem;
    });
}

export default function applyDiscounts(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartAction[] {
  const cartActions = [] as CartAction[];
  const { commerceToolsCart, cartDiscountApplyMode, taxCategory } =
    dataToRunCartActionsBuilder;

  if (cartDiscountApplyMode === CartDiscountApplyMode.CustomLineItem) {
    cartActions.push(
      ...removeDiscountedCustomLineItems(commerceToolsCart),
      ...addCustomLineItemWithDiscountSummary(
        commerceToolsCart,
        dataToRunCartActionsBuilder,
        taxCategory,
      ),
    );
  }
  if (cartDiscountApplyMode === CartDiscountApplyMode.DirectDiscount) {
    cartActions.push(
      ...removeDiscountedCustomLineItems(commerceToolsCart),
      ...addDirectDiscountWithDiscountSummary(
        commerceToolsCart,
        dataToRunCartActionsBuilder,
      ),
    );
  }

  return cartActions;
}
