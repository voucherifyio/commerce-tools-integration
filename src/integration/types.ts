import {
  DiscountVouchersEffectTypes,
  RedemptionsRedeemStackableResponse,
  StackableRedeemableResponse,
} from '@voucherify/sdk';
import { OrdersCreate } from '@voucherify/sdk/dist/types/Orders';
import { CustomerRequest } from '@voucherify/sdk/dist/types/Customers';

export type CartUpdateHandler = (
  cart: Cart,
  storeActions?: CartUpdateActionsInterface,
) => void;

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
  discount_difference: boolean;
  applied_discount_amount?: number;
  product: string; // sku source_id
  distributionChannel: any;
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

export type ExpectedProductToAdd = {
  code: string;
  quantity: number;
  product: string;
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

export interface CartUpdateActionsInterface {
  setAvailablePromotions(promotions: availablePromotion[]); //starting value: []
  setProductsToAdd(productsToAdd: ProductToAdd[]); //starting value: []
  setTotalDiscountAmount(totalDiscountAmount: number); //starting value: 0
  setApplicableCoupons(applicableCoupons: StackableRedeemableResponse[]); //starting value: []
  setInapplicableCoupons(inapplicableCoupons: StackableRedeemableResponse[]); //starting value: []
  setSessionKey(sessionKey: string); //starting value: undefined
  getProductsToAdd: (
    discountTypeUnit: StackableRedeemableResponse[],
  ) => Promise<ProductToAdd[]>; //function to get price/SKU/ids of products from unit type coupons
}

export interface OrderPaidActionsInterface {
  getCustomMetadataForOrder?: (
    order: any,
    allMetadataSchemaProperties: string[],
  ) => Promise<{ [key: string]: string }>; //function to handle custom metadata for order (for example: metadata from custom fields)
}
