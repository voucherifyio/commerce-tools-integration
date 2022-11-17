import {
  DiscountVouchersEffectTypes,
  StackableRedeemableResponse,
} from '@voucherify/sdk';
import { ChannelReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/channel';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { CustomerRequest } from '@voucherify/sdk/dist/types/Customers';
import { PriceSelector } from '../commercetools/types';

export type ProductToAdd = {
  code: string; // coupon code
  effect: DiscountVouchersEffectTypes;
  quantity?: number;
  discount_quantity?: number;
  initial_quantity: number;
  discount_difference: boolean;
  applied_discount_amount?: number;
  product: string; // sku source_id
  distributionChannel: ChannelReference;
};

export type availablePromotion = {
  status: string;
  value: number;
  banner: string;
  code: string;
};

export type Coupon = {
  code: string;
  status: CouponStatus;
  type?: CouponType;
  errMsg?: string;
  value?: number;
};

export type SentCoupons = {
  result: string;
  coupon: string;
};

export type Item = {
  source_id: string;
  quantity: number;
  price: number;
  amount: number;
  name: string;
  sku: string;
  attributes?: { name: string; value: any }[];
};

export type Cart = {
  id: string;
  customerId?: string;
  anonymousId?: string;
  sessionKey?: string;
  coupons: Coupon[];
  items: Item[];
};

export type Order = {
  id: string;
  customer?: CustomerRequest;
  customerId: string;
  status?: OrdersCreate['status'];
  coupons: Coupon[];
  items: Item[];
  sessionKey: string;
  rawOrder?: any;
};

export type GetProductsToAddListener = (
  discountTypeUnit: StackableRedeemableResponse[],
) => Promise<ProductToAdd[]>;

export type CouponStatus = 'NEW' | 'APPLIED' | 'NOT_APPLIED' | 'DELETED';
export type CouponType = 'promotion_tier' | 'voucher';
