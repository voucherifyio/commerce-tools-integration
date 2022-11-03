import { TaxCategory } from '@commercetools/platform-sdk';
import {
  DiscountVouchersEffectTypes,
  StackableRedeemableResponse,
} from '@voucherify/sdk';
import { CartAction } from '../commercetools/cartActions/CartAction';
import { CustomerGroupReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/customer-group';
import { ChannelReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/channel';

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
  applicableCoupons: StackableRedeemableResponse[];
  notApplicableCoupons: StackableRedeemableResponse[];
  skippedCoupons: StackableRedeemableResponse[];
  newSessionKey?: string;
  valid: boolean;
  totalDiscountAmount: number;
  productsToAdd: ProductToAdd[];
  onlyNewCouponsFailed?: boolean;
  allInapplicableCouponsArePromotionTier?: boolean;
  couponsLimit: number;
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

export type CouponStatus = 'NEW' | 'APPLIED' | 'NOT_APPLIED' | 'DELETED';
export type CouponType = 'promotion_tier' | 'voucher';
