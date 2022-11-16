import { Coupon } from '../../../integration/types';
import {
  CartAction,
  CartActionSetCustomFieldFreeShipping,
  CartActionSetCustomFieldWithCoupons,
  CartActionSetCustomFieldWithCouponsLimit,
  CartActionSetCustomFieldWithSession,
  CartActionSetCustomFieldWithValidationFailed,
  DataToRunCartActionsBuilder,
} from '../CartAction';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import {
  FREE_SHIPPING,
  FREE_SHIPPING_UNIT_TYPE,
} from '../../../consts/voucherify';
import { deserializeCoupons } from '../../../integration/utils/helperFunctions';

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
):
  | CartActionSetCustomFieldWithCoupons[]
  | CartActionSetCustomFieldWithValidationFailed[] {
  const { availablePromotions, applicableCoupons, inapplicableCoupons } =
    dataToRunCartActionsBuilder;
  const validationFailedAction = [];
  const oldCouponsCodes: Coupon[] = (
    dataToRunCartActionsBuilder.commerceToolsCart.custom?.fields
      ?.discount_codes ?? []
  ).map(deserializeCoupons);
  const coupons = [
    ...availablePromotions,
    ...applicableCoupons.map((coupon) => {
      let value;
      if (Object.keys(coupon?.result).length) {
        value =
          coupon.result.discount?.unit_type === FREE_SHIPPING_UNIT_TYPE
            ? FREE_SHIPPING
            : typeof (
                coupon.order?.applied_discount_amount ||
                coupon.order?.items_applied_discount_amount ||
                coupon.order?.total_discount_amount
              ) === 'number'
            ? coupon.order?.applied_discount_amount ||
              coupon.order?.items_applied_discount_amount ||
              coupon.order?.total_discount_amount
            : coupon.result?.discount?.amount_off || 0;
      } else {
        value = oldCouponsCodes.find(
          (oldCoupon) => coupon.id === oldCoupon.code,
        )?.value;
      }
      return {
        code: coupon['banner'] ? coupon['banner'] : coupon.id,
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
          errMsg: coupon.result?.error?.error?.message
            ? coupon.result?.error?.error.message
            : coupon.result?.error?.message,
        } as Coupon),
    ),
  ];

  return [
    {
      action: 'setCustomField',
      name: 'discount_codes',
      value: coupons.map((coupon) => JSON.stringify(coupon)) as string[],
    },
    ...validationFailedAction,
  ];
}

export default function setCustomFields(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartAction[] {
  const cartActions = [] as CartAction[];

  cartActions.push(setSessionAsCustomField(dataToRunCartActionsBuilder));
  cartActions.push(...updateDiscountsCodes(dataToRunCartActionsBuilder));
  cartActions.push(addShippingProductSourceIds(dataToRunCartActionsBuilder));
  cartActions.push(setCouponsLimit(dataToRunCartActionsBuilder));

  return cartActions;
}
