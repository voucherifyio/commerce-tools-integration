import { TaxCategory } from '@commercetools/platform-sdk';
import {
  DiscountVouchersEffectTypes,
  StackableRedeemableResponse,
} from '@voucherify/sdk';
import { CartAction } from './cartActions/CartAction';

export type CartResponse = { status: boolean; actions: CartAction[] };

export type ProductToAdd = {
  code: string; // coupon code
  effect: DiscountVouchersEffectTypes;
  quantity?: number;
  discount_quantity?: number;
  initial_quantity: number;
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
