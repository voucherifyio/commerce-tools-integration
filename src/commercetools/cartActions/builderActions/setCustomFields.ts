import { Cart } from '@commercetools/platform-sdk';
import {
  Coupon,
  ExtendedValidateCouponsResult,
} from '../../../integration/types';
import {
  CartAction,
  CartActionSetCustomFieldFreeShipping,
  CartActionSetCustomFieldWithCoupons,
  CartActionSetCustomFieldWithCouponsLimit,
  CartActionSetCustomFieldWithSession,
  CartActionSetCustomFieldWithValidationFailed,
} from '../CartAction';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import {
  FREE_SHIPPING,
  FREE_SHIPPING_UNIT_TYPE,
} from '../../../consts/voucherify';
import isValidAndNewCouponNotFailed from '../helpers/utils';
import {
  checkIfAllInapplicableCouponsArePromotionTier,
  checkIfOnlyNewCouponsFailed,
  deserializeCoupons,
  getCouponsFromCart,
} from '../../../integration/helperFunctions';
import { getCouponsByStatus } from '../../utils/getCouponsByStatus';
import { uniqBy } from 'lodash';

function setSessionAsCustomField(
  cart: Cart,
  extendedValidateCouponsResult: ExtendedValidateCouponsResult,
): CartActionSetCustomFieldWithSession {
  const { valid, newSessionKey } = extendedValidateCouponsResult;
  const sessionKey = cart.custom?.fields?.session ?? null;
  if (!valid || !newSessionKey || newSessionKey === sessionKey) {
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
  extendedValidateCouponsResult: ExtendedValidateCouponsResult,
): CartActionSetCustomFieldFreeShipping {
  return {
    action: 'setCustomField',
    name: 'shippingProductSourceIds',
    value: getShippingProductSourceIds(
      extendedValidateCouponsResult.applicableCoupons,
    ),
  };
}

function setCouponsLimit(
  extendedValidateCouponsResult: ExtendedValidateCouponsResult,
): CartActionSetCustomFieldWithCouponsLimit {
  return {
    action: 'setCustomField',
    name: 'couponsLimit',
    value: +extendedValidateCouponsResult.couponsLimit,
  };
}

function updateDiscountsCodes(
  cart: Cart,
  extendedValidateCouponsResult: ExtendedValidateCouponsResult,
):
  | CartActionSetCustomFieldWithCoupons[]
  | CartActionSetCustomFieldWithValidationFailed[] {
  const {
    availablePromotions,
    applicableCoupons,
    notApplicableCoupons,
    onlyNewCouponsFailed,
    allInapplicableCouponsArePromotionTier,
    skippedCoupons,
  } = extendedValidateCouponsResult;
  const validationFailedAction = [];
  const oldCouponsCodes: Coupon[] = (
    cart.custom?.fields?.discount_codes ?? []
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
    ...notApplicableCoupons.map(
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

  if (onlyNewCouponsFailed || allInapplicableCouponsArePromotionTier) {
    coupons.push(
      ...skippedCoupons.map(
        (coupon) =>
          ({
            code: coupon.id,
            status: 'APPLIED',
            value:
              oldCouponsCodes.find((oldCoupon) => coupon.id === oldCoupon.code)
                ?.value || 0,
          } as Coupon),
      ),
    );
  } else if (skippedCoupons.length) {
    console.log(2);
    validationFailedAction.push({
      action: 'setCustomField',
      name: 'isValidationFailed',
      value: true,
    });
  } else {
    validationFailedAction.push({
      action: 'setCustomField',
      name: 'isValidationFailed',
      value: false,
    });
  }

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
  cart: Cart,
  extendedValidateCouponsResult: ExtendedValidateCouponsResult,
): CartAction[] {
  const cartActions = [] as CartAction[];

  cartActions.push(
    setSessionAsCustomField(cart, extendedValidateCouponsResult),
  );
  cartActions.push(
    ...updateDiscountsCodes(cart, extendedValidateCouponsResult),
  );

  if (isValidAndNewCouponNotFailed(extendedValidateCouponsResult)) {
    cartActions.push(
      addShippingProductSourceIds(extendedValidateCouponsResult),
    );
    cartActions.push(setCouponsLimit(extendedValidateCouponsResult));
  }

  return cartActions;
}
