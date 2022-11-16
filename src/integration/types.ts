import {
  DiscountVouchersEffectTypes,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { CartAction } from '../commercetools/cartActions/CartAction';
import { CustomerGroupReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/customer-group';
import { ChannelReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/channel';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import { TaxCategory } from '@commercetools/platform-sdk';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { CustomerRequest } from '@voucherify/sdk/dist/types/Customers';

export type CartResponse = { status: boolean; actions: CartAction[] };

export type PriceSelector = {
  country: string;
  currencyCode: string;
  customerGroup: CustomerGroupReference;
  distributionChannels: ChannelReference[];
};

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

export type ValidateCouponsResult = {
  availablePromotions: availablePromotion[];
  validatedCoupons?: ValidationValidateStackableResponse;
  productsToAdd?: ProductToAdd[];
};

export enum CartDiscountApplyMode {
  CustomLineItem,
  DirectDiscount,
}

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
  coupons: Coupon[]; //please make sure, coupon codes are uniq!
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

export type CouponStatus = 'NEW' | 'APPLIED' | 'NOT_APPLIED' | 'DELETED';
export type CouponType = 'promotion_tier' | 'voucher';
