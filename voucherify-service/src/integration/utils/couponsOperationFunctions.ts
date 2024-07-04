import { Coupon } from '../types';
import { uniqBy } from 'lodash';

export function couponsStatusDeleted(coupons: Coupon[]) {
  return coupons.filter((coupon) => coupon.status === 'DELETED');
}

export function couponsStatusApplied(coupons: Coupon[]) {
  return coupons.filter((coupon) => coupon.status === 'APPLIED');
}

export function couponsStatusNew(coupons: Coupon[]) {
  return coupons.filter((coupon) => coupon.status === 'NEW');
}

export function filterOutCouponsTypePromotionTier(coupons: Coupon[]) {
  return coupons.filter((coupon) => coupon.type !== 'promotion_tier');
}

export function filterOutCouponsStatusNew(coupons: Coupon[]) {
  return coupons.filter((coupon) => coupon.status !== 'NEW');
}

export function uniqueCouponsByCodes(coupons: Coupon[]) {
  return uniqBy(coupons, 'code');
}

export function codesFromCoupons(coupons: Coupon[]) {
  return coupons.map((coupon) => coupon.code);
}

export function filterOutCouponsIfCodeIn(
  coupons: Coupon[],
  forbiddenCodes: string[],
) {
  return coupons.filter((coupon) => !forbiddenCodes.includes(coupon.code));
}
