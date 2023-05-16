import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk';
import {
  CartActionSetLineItemCustomType,
  DataToRunCartActionsBuilder,
} from '../CartAction';
import { StackableRedeemableResponse } from '@voucherify/sdk';

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
    return coupon.applicable_to?.data?.map((applicable) => {
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
      .filter((couponLineItem) => couponLineItem.sku?.id === fixedCoupon?.id)
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
  cart: CommerceToolsCart,
  lineItemsWithFixedAmount,
  applicableCoupons: StackableRedeemableResponse[],
): CartActionSetLineItemCustomType[] {
  const applicableCouponsIds = applicableCoupons.map(
    (couponData) => couponData.id,
  );
  return cart.lineItems.map((lineItem) => {
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

    const applied_codes = lineItem.custom?.fields?.applied_codes;
    if (applied_codes?.length) {
      let _applied_codes = applied_codes
        .map((codeString) => JSON.parse(codeString))
        .filter((codeData) => applicableCouponsIds.includes(codeData.code));
      let totalDiscountQuantity = 0;
      for (const applied_code of _applied_codes) {
        totalDiscountQuantity += applied_code.quantity;
      }
      _applied_codes = _applied_codes
        .filter((codeData) => codeData.quantity > 0)
        .map((codeData) => {
          return { ...codeData, totalDiscountQuantity };
        });
      action.fields.applied_codes = _applied_codes.map((codeData) =>
        JSON.stringify(codeData),
      );
    }

    return action;
  });
}

export default function mapValidateCouponsResultToLineProductsWithFixedAmount(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartActionSetLineItemCustomType[] {
  const { applicableCoupons } = dataToRunCartActionsBuilder;

  const fixedTypeCoupons = applicableCoupons.filter(
    (coupon) => coupon.result.discount?.type === 'FIXED',
  );

  const fixedCouponApplicableTo = getFixedCouponApplicableTo(fixedTypeCoupons);
  const couponLineItems = getLineItemsFromApplicableCoupons(fixedTypeCoupons);

  const lineProductsWithFixedAmount = getLineItemsWithFixedAmount(
    fixedCouponApplicableTo,
    couponLineItems,
  );

  return getLineItemCustomFieldActions(
    dataToRunCartActionsBuilder.commerceToolsCart,
    lineProductsWithFixedAmount,
    applicableCoupons,
  );
}
