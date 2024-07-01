import {
  DiscountAmount,
  DiscountFixed,
  DiscountPercent,
  DiscountUnit,
  DiscountVouchersEffectTypes,
  RedemptionsRedeemStackableResponse,
  StackableRedeemableResponse,
  StackableRedeemableResultDiscountUnit,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { OrdersCreate, OrdersItem } from '@voucherify/sdk/dist/types/Orders';
import { CustomerRequest } from '@voucherify/sdk/dist/types/Customers';

export type CartUpdateHandler = (
  cart: Cart,
  storeActions?: CartUpdateActionsInterface,
) => Promise<void>;

export type OrderRedeemHandler = (
  order: Order,
  storeActions?: OrderPaidActionsInterface,
) => Promise<{
  actions: { name: string; action: string; value: string[] }[];
  status: boolean;
  redemptionsRedeemStackableResponse?: RedemptionsRedeemStackableResponse;
}>;

export type ProductToAdd = {
  code: string; // coupon code
  effect: DiscountVouchersEffectTypes;
  quantity?: number;
  discount_quantity?: number;
  initial_quantity: number;
  applied_discount_amount?: number;
  product: string; // sku source_id
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

export type ProductsFromRedeemables = {
  code: string;
  quantity: number;
  product: string;
};

export type ProductPriceAndSourceId = {
  price: number | undefined;
  id: string;
};

export type GetProductsToAddListener = (
  discountTypeUnit: StackableRedeemableResponse[],
) => Promise<ProductToAdd[]>;

export type CouponStatus = 'NEW' | 'APPLIED' | 'NOT_APPLIED' | 'DELETED';
export type CouponType = 'promotion_tier' | 'voucher';

export interface StoreInterface {
  setCartUpdateListener: (handler: CartUpdateHandler) => void;
  setOrderPaidListener: (handler: OrderRedeemHandler) => void;
}

export interface StackableRedeemableResultDiscountUnitWithCodeAndPrice
  extends StackableRedeemableResultDiscountUnit {
  code: string;
  price: number | undefined;
}

export interface CartUpdateActionsInterface {
  setAvailablePromotions(promotions: availablePromotion[]); //starting value: []
  setProductsToAdd(productsToAdd: ProductToAdd[]); //starting value: []
  setTotalDiscountAmount(totalDiscountAmount: number); //starting value: 0
  setApplicableCoupons(applicableCoupons: StackableRedeemableResponse[]); //starting value: []
  setInapplicableCoupons(inapplicableCoupons: StackableRedeemableResponse[]); //starting value: []
  setSessionKey(sessionKey: string); //starting value: undefined
  setCouponsLimit(couponsLimit: number);
  getPricesOfProductsFromCommercetools: (
    freeUnits: StackableRedeemableResultDiscountUnit[],
  ) => Promise<{
    found: ProductPriceAndSourceId[];
    notFound: string[];
  }>; //function to get price/SKU/ids of products from unit type coupons
}

export interface OrderPaidActionsInterface {
  getCustomMetadataForOrder?: (
    order: any,
    allMetadataSchemaProperties: string[],
  ) => Promise<{ [key: string]: string }>; //function to handle custom metadata for order (for example: metadata from custom fields)
}

export type AvailablePromotion = {
  status: string;
  value: number;
  banner: string;
  code: string;
  type: 'promotion_tier';
};

export type ValidatedCoupons = ValidationValidateStackableResponse & {
  inapplicable_redeemables?: StackableRedeemableResponse[];
  skipped_redeemables?: StackableRedeemableResponse[];
  stacking_rules: {
    redeemables_limit: number;
    applicable_redeemables_limit: number;
    applicable_exclusive_redeemables_limit: number;
    applicable_redeemables_per_category_limit: number;
    exclusive_categories: string[];
    joint_categories: string[];
    redeemables_application_mode: string;
    redeemables_sorting_rule: string;
  };
};

export type Promotions = {
  id: string;
  object: 'promotion_tier';
  banner?: string;
  name: string;
  start_date?: string;
  expiration_date?: string;
  discount?: DiscountUnit | DiscountAmount | DiscountPercent | DiscountFixed;
  discount_amount?: number;
  applied_discount_amount?: number;
  metadata?: Record<string, any>;
  order?: {
    id?: string;
    source_id?: string;
    amount: number;
    initial_amount?: number;
    items_discount_amount?: number;
    items_applied_discount_amount?: number;
    items?: OrdersItem[];
    metadata?: Record<string, any>;
    discount_amount?: number;
    total_discount_amount?: number;
    total_amount?: number;
    applied_discount_amount?: number;
    total_applied_discount_amount?: number;
  };
  hierarchy?: number;
}[];
