export type Coupon = {
  code: string;
  status: CouponStatus;
  type?: string;
  errMsg?: string;
  value?: number;
};

export type CouponStatus = 'NEW' | 'APPLIED' | 'NOT_APPLIED' | 'DELETED';

export function desarializeCoupons(serializedDiscountOrCode: string): Coupon {
  if (serializedDiscountOrCode.startsWith('{')) {
    return JSON.parse(serializedDiscountOrCode);
  }
  // that case handle legacy way of saving coupons in Commerce Tools
  return {
    code: serializedDiscountOrCode,
    status: 'NEW',
  };
}
