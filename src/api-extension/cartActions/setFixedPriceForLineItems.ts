import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { CartActionSetLineItemCustomType } from './CartAction';

type FixedCouponApplicableTo = {
  id: string;
  price: number;
};

function getLineItemsFromApplicableCoupons(applicableCoupons) {
  let lineItems = applicableCoupons.flatMap((coupon) => {
    return coupon.order.items;
  });

  // We want to get unique lineItems with lower subtotal amount
  lineItems.sort((a, b) => b.subtotal_amount - a.subtotal_amount);
  lineItems = [
    ...new Map(lineItems.map((item) => [item.source_id, item])).values(),
  ];

  return lineItems;
}

function getFixedCouponApplicableTo(fixedTypeCoupons) {
  let fixedCouponApplicableTo = fixedTypeCoupons.flatMap((coupon) => {
    return coupon.applicable_to.data.map((applicable) => {
      return {
        id: applicable.id,
        price: applicable.price,
      } as FixedCouponApplicableTo;
    });
  });

  // If there are multiple coupon for one product take more profitable price
  fixedCouponApplicableTo.sort((a, b) => b.price - a.price);
  fixedCouponApplicableTo = [
    ...new Map(fixedCouponApplicableTo.map((item) => [item.id, item])).values(),
  ];

  return fixedCouponApplicableTo;
}

function getLineItemsWithFixedAmount(
  fixedCouponApplicableTo: FixedCouponApplicableTo[],
  couponLineItems,
) {
  return fixedCouponApplicableTo.flatMap((fixedCoupon) => {
    return couponLineItems
      .filter((couponLineItem) => couponLineItem.sku.id === fixedCoupon.id)
      .map((couponLineItem) => {
        if (
          fixedCoupon.price ===
          couponLineItem.subtotal_amount / couponLineItem.quantity
        ) {
          return {
            ...couponLineItem,
            couponFixedPrice: fixedCoupon.price,
          };
        }
      })
      .filter((couponLineItem) => couponLineItem !== undefined);
  });
}

function getLineItemCustomFieldActions(
  cart: Cart,
  lineItemsWithFixedAmount,
): CartActionSetLineItemCustomType[] {
  const actions = cart.lineItems.map((lineItem) => {
    const action = {
      action: 'setLineItemCustomType',
      lineItemId: lineItem.id,
      type: {
        key: 'lineItemCodesType',
      },
      fields: {},
    } as CartActionSetLineItemCustomType;

    const lineItemWithFixedAmount = lineItemsWithFixedAmount.filter(
      (lineItemWithFixedAmount) =>
        lineItem.productId === lineItemWithFixedAmount.product.source_id,
    );

    if (lineItemWithFixedAmount.length > 0) {
      action.fields.coupon_fixed_price =
        lineItemWithFixedAmount[0].couponFixedPrice;
    }

    // Make sure you add case here if more lineItem custom fields will be added
    if (lineItem.custom?.fields?.applied_codes) {
      action.fields.applied_codes = lineItem.custom.fields.applied_codes;
    }

    return action;
  });

  return actions;
}

export default function setFixedPriceForLineItems(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetLineItemCustomType[] {
  const fixedTypeCoupons = validateCouponsResult.applicableCoupons.filter(
    (coupon) => coupon.result.discount.type === 'FIXED',
  );

  const fixedCouponApplicableTo = getFixedCouponApplicableTo(fixedTypeCoupons);
  const couponLineItems = getLineItemsFromApplicableCoupons(fixedTypeCoupons);

  const lineProductsWithFixedAmount = getLineItemsWithFixedAmount(
    fixedCouponApplicableTo,
    couponLineItems,
  );

  return getLineItemCustomFieldActions(cart, lineProductsWithFixedAmount);
}
