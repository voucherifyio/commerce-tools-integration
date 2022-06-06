export type Coupon = {
  code: string;
  status: 'NEW' | 'APPLIED' | 'NOT_APPLIED';
  errMsg?: string;
};

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
