import { Coupon } from '../../../../integration/types';
import {
  CartAction,
  CartActionSetCustomFieldFreeShipping,
  CartActionSetCustomFieldWithCoupons,
  CartActionSetCustomFieldWithCouponsLimit,
  CartActionSetCustomFieldWithSession,
  DataToRunCartActionsBuilder,
} from '../CartAction';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import {
  FREE_SHIPPING,
  FREE_SHIPPING_UNIT_TYPE,
} from '../../../../consts/voucherify';

function setSessionAsCustomField(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartActionSetCustomFieldWithSession {
  const { newSessionKey } = dataToRunCartActionsBuilder;
  const sessionKey =
    dataToRunCartActionsBuilder.commerceToolsCart.custom?.fields?.session ??
    null;
  if (!newSessionKey || newSessionKey === sessionKey) {
    return;
  }

  return {
    action: 'setCustomField',
    name: 'session',
    value: newSessionKey,
  } as CartActionSetCustomFieldWithSession;
}

function getShippingProductSourceIds(
  applicableCoupons: StackableRedeemableResponse[],
): string[] {
  return [
    ...new Set(
      applicableCoupons
        .filter((coupon) => coupon.result.discount?.type === 'UNIT')
        .flatMap((coupon) => {
          if (coupon.result.discount?.units) {
            return coupon.result.discount.units.map((unit) => {
              return unit?.product?.source_id;
            });
          } else {
            return coupon.result.discount?.product?.source_id;
          }
        })
        .filter((coupon) => coupon != undefined),
    ),
  ];
}

function addShippingProductSourceIds(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartActionSetCustomFieldFreeShipping {
  return {
    action: 'setCustomField',
    name: 'shippingProductSourceIds',
    value: getShippingProductSourceIds(
      dataToRunCartActionsBuilder.applicableCoupons,
    ),
  };
}

function setCouponsLimit(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartActionSetCustomFieldWithCouponsLimit {
  return {
    action: 'setCustomField',
    name: 'couponsLimit',
    value: +dataToRunCartActionsBuilder.couponsLimit,
  };
}

function updateDiscountsCodes(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartActionSetCustomFieldWithCoupons {
  const { availablePromotions, applicableCoupons, inapplicableCoupons } =
    dataToRunCartActionsBuilder;
  const coupons = [
    ...applicableCoupons.map((coupon) => {
      const value =
        coupon.result.discount?.unit_type === FREE_SHIPPING_UNIT_TYPE
          ? FREE_SHIPPING
          : coupon.order.applied_discount_amount ||
            coupon.order.items_applied_discount_amount ||
            0;
      return {
        code: coupon.id,
        banner: coupon['banner'] || undefined,
        status: 'APPLIED',
        type: coupon.object,
        value: value,
      } as Coupon;
    }),
    ...inapplicableCoupons.map(
      (coupon) =>
        ({
          code: coupon.id,
          status: 'NOT_APPLIED',
          errMsg:
            coupon.result?.error?.message ||
            // @ts-ignore Voucherify SDK is outdated
            coupon.result?.details?.message ||
            'Unknown error',
        } as Coupon),
    ),
    //keep it at the bottom!, if status change from `AVAILABLE` to `NEW` it will be applied in correct order.
    ...availablePromotions,
  ];

  return {
    action: 'setCustomField',
    name: 'discount_codes',
    value: coupons.map((coupon) => JSON.stringify(coupon)),
  };
}

export default function setCustomFields(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartAction[] {
  const cartActions = [] as CartAction[];

  cartActions.push(setSessionAsCustomField(dataToRunCartActionsBuilder));
  cartActions.push(updateDiscountsCodes(dataToRunCartActionsBuilder));
  cartActions.push(addShippingProductSourceIds(dataToRunCartActionsBuilder));
  if (dataToRunCartActionsBuilder.couponsLimit) {
    cartActions.push(setCouponsLimit(dataToRunCartActionsBuilder));
  }

  return cartActions;
}
