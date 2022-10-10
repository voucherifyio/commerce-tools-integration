import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../../types';
import {
  CartAction,
  CartActionSetCustomFieldFreeShipping,
  CartActionSetCustomFieldWithCoupons,
  CartActionSetCustomFieldWithCouponsLimit,
  CartActionSetCustomFieldWithSession,
  CartActionSetCustomFieldWithValidationFailed,
} from '../CartAction';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import { Coupon, desarializeCoupons } from '../../coupon';
import {
  FREE_SHIPPING,
  FREE_SHIPPING_UNIT_TYPE,
} from '../../../consts/voucherify';

function setSessionAsCustomField(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetCustomFieldWithSession {
  const { valid, newSessionKey } = validateCouponsResult;
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
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetCustomFieldFreeShipping {
  return {
    action: 'setCustomField',
    name: 'shippingProductSourceIds',
    value: getShippingProductSourceIds(validateCouponsResult.applicableCoupons),
  };
}

function setCouponsLimit(
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetCustomFieldWithCouponsLimit {
  return {
    action: 'setCustomField',
    name: 'couponsLimit',
    value: +validateCouponsResult.couponsLimit,
  };
}

function updateDiscountsCodes(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
):
  | CartActionSetCustomFieldWithCoupons[]
  | CartActionSetCustomFieldWithValidationFailed[] {
  const {
    availablePromotions,
    applicableCoupons,
    notApplicableCoupons,
    skippedCoupons,
    onlyNewCouponsFailed,
    allInapplicableCouponsArePromotionTier,
  } = validateCouponsResult;
  const validationFailedAction = [];
  const oldCouponsCodes: Coupon[] = (
    cart.custom?.fields?.discount_codes ?? []
  ).map(desarializeCoupons);
  const coupons = [
    ...availablePromotions,
    ...applicableCoupons.map((coupon) => {
      let value;
      if (Object.keys(coupon?.result).length) {
        value =
          coupon.result.discount?.unit_type === FREE_SHIPPING_UNIT_TYPE
            ? FREE_SHIPPING
            : coupon.order?.applied_discount_amount ||
              coupon.order?.items_applied_discount_amount ||
              coupon.result?.discount?.amount_off ||
              0;
      } else {
        value = oldCouponsCodes.find(
          (oldCoupon) => coupon.id === oldCoupon.code,
        )?.value;
      }
      return {
        code: coupon.id,
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
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;
  const cartActions = [] as CartAction[];

  cartActions.push(setSessionAsCustomField(cart, validateCouponsResult));
  cartActions.push(...updateDiscountsCodes(cart, validateCouponsResult));

  if (valid || !onlyNewCouponsFailed) {
    cartActions.push(addShippingProductSourceIds(validateCouponsResult));
    cartActions.push(setCouponsLimit(validateCouponsResult));
  }

  return cartActions;
}
