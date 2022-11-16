import {
  Cart as CommerceToolsCart,
  Order as CommerceToolsOrder,
} from '@commercetools/platform-sdk';
import {
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { Coupon, CouponStatus } from './types';
import { uniqBy } from 'lodash';

export function deserializeCoupons(serializedDiscountOrCode: string): Coupon {
  if (serializedDiscountOrCode.startsWith('{')) {
    return JSON.parse(serializedDiscountOrCode);
  }
  // that case handle legacy way of saving coupons in Commerce Tools
  return {
    code: serializedDiscountOrCode,
    status: 'NEW',
  };
}

export function getCouponsFromCartOrOrder(
  cart: CommerceToolsCart | CommerceToolsOrder,
): Coupon[] {
  const coupons = (cart.custom?.fields?.discount_codes ?? [])
    .map(deserializeCoupons)
    .filter(
      (coupon) =>
        coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
    ); // we already declined them, will be removed by frontend
  return uniqBy(coupons, 'code');
}

function checkCouponsValidatedAsState(
  coupons: Coupon[],
  validatedCoupons: StackableRedeemableResponse[],
  status: CouponStatus,
): boolean {
  return (
    validatedCoupons.length === 0 ||
    coupons
      .filter((coupon) => coupon.status === status)
      .every((coupon) =>
        validatedCoupons.find((element) => element.id === coupon.code),
      )
  );
}

export function checkIfAllInapplicableCouponsArePromotionTier(
  notApplicableCoupons: StackableRedeemableResponse[],
) {
  const inapplicableCouponsPromitonTier = notApplicableCoupons.filter(
    (notApplicableCoupon) => notApplicableCoupon.object === 'promotion_tier',
  );

  return notApplicableCoupons.length === inapplicableCouponsPromitonTier.length;
}

export function checkIfOnlyNewCouponsFailed(
  coupons: Coupon[],
  applicableCoupons: StackableRedeemableResponse[],
  notApplicableCoupons: StackableRedeemableResponse[],
): boolean {
  const areAllNewCouponsNotApplicable = checkCouponsValidatedAsState(
    coupons,
    notApplicableCoupons,
    'NEW',
  );

  const areAllAppliedCouponsApplicable = checkCouponsValidatedAsState(
    coupons,
    applicableCoupons,
    'APPLIED',
  );

  return (
    notApplicableCoupons.length !== 0 &&
    areAllNewCouponsNotApplicable &&
    areAllAppliedCouponsApplicable
  );
}

export function filterCouponsByLimit(coupons: Coupon[], couponsLimit: number) {
  if (coupons.length > couponsLimit) {
    const couponsToRemove = coupons.length - couponsLimit;
    const newCouponsCodes = coupons
      .filter((coupon) => coupon.status === 'NEW')
      .map((coupon) => coupon.code);

    coupons = coupons.filter(
      (coupon) => !newCouponsCodes.includes(coupon.code),
    );

    if (newCouponsCodes.length < couponsToRemove) {
      coupons = coupons.splice(
        0,
        coupons.length - (couponsToRemove - newCouponsCodes.length),
      );
    }
  }
  return coupons;
}

export function calculateTotalDiscountAmount(
  validatedCoupons: ValidationValidateStackableResponse,
) {
  let totalDiscountAmount = 0;
  if (
    validatedCoupons.redeemables.find(
      (redeemable) => redeemable?.order?.items?.length,
    )
  ) {
    //Voucherify "order.total_applied_discount_amount" is not always calculated correctly,
    //so we need to iterate through the items to calculated discounted amount
    validatedCoupons.redeemables.forEach((redeemable) => {
      redeemable.order.items.forEach((item) => {
        if ((item as any).total_applied_discount_amount) {
          totalDiscountAmount += (item as any).total_applied_discount_amount;
        } else if ((item as any).total_discount_amount) {
          totalDiscountAmount += (item as any).total_discount_amount;
        }
      });
    });
  }

  if (totalDiscountAmount === 0) {
    return (
      validatedCoupons.order?.total_applied_discount_amount ??
      validatedCoupons.order?.total_discount_amount ??
      0
    );
  }

  if (totalDiscountAmount > (validatedCoupons?.order?.amount ?? 0)) {
    return validatedCoupons.order.amount;
  }
  return totalDiscountAmount;
}
