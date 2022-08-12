import { TaxCategory } from '@commercetools/platform-sdk';
import {
  DiscountVouchersEffectTypes,
  StackableRedeemableResponse,
} from '@voucherify/sdk';
import { CartAction } from './cartActions/CartAction';
import { CustomerGroupReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/customer-group';

export type CartResponse = { status: boolean; actions: CartAction[] };

export type PriceSelector = {
  country: string;
  currencyCode: string;
  customerGroup: CustomerGroupReference;
  channelId: number;
};

export type ProductToAdd = {
  code: string; // coupon code
  effect: DiscountVouchersEffectTypes;
  quantity?: number;
  discount_quantity?: number;
  initial_quantity: number;
  discount_difference: number;
  applied_discount_amount?: number;
  product: string; // sku source_id
};

export type ValidateCouponsResult = {
  applicableCoupons: StackableRedeemableResponse[];
  notApplicableCoupons: StackableRedeemableResponse[];
  skippedCoupons: StackableRedeemableResponse[];
  newSessionKey?: string;
  valid: boolean;
  totalDiscountAmount: number;
  productsToAdd: ProductToAdd[];
  onlyNewCouponsFailed?: boolean;
  taxCategory?: TaxCategory;
};
