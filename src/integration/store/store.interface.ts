import {OrdersItem} from '@voucherify/sdk'
export interface CartActionsInterface {
  setAvailablePromotions: () => Promise<boolean>;
  setFreeShipping: () => Promise<boolean>;
  addCoupon: () => Promise<boolean>;
  getCoupons: () => Promise<boolean>;
  updateCoupon: () => Promise<boolean>;
  removeCoupon: () => Promise<boolean>;
  setCartDiscount: (amount: number) => Promise<boolean>;
}

export type CouponStatus = 'NEW' | 'APPLIED' | 'NOT_APPLIED' | 'DELETED';
export type CouponType = 'promotion_tier' | 'voucher';

export type Coupon = {
  code: string;
  status: CouponStatus;
  type?: CouponType;
  errMsg?: string;
  value?: number;
};

export type Cart = {
  items: OrdersItem[];
  session?: string,
  coupons: Coupon[],
  metadata?: Record<string, any>,
};

export type CartUpdateHandler = (
  cart: Cart,
  actions: CartActionsInterface,
) => Promise<boolean>;

export interface StoreInterface {
  onCartUpdate: (handler: CartUpdateHandler) => void;
  // onOrderUpdate: (cart: CartActionsInterface) => Promise<boolean>;
  // onCustomerUpdate: (customer) => Promise<boolean>;
}
