import {
  CartDiscountTarget,
  CartDiscountValueDraft,
  TaxCategory,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { availablePromotion, ProductToAdd } from '../../../integration/types';
import { ChannelReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/channel';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import { CartDiscountApplyMode } from '../../types';

export type CartActionSetCustomType = {
  action: 'setCustomType';
  name: 'couponCodes';
  type: {
    id: string;
  };
};

export type CartActionSetCustomFieldWithCoupons = {
  action: 'setCustomField';
  name: 'discount_codes';
  value: string[];
};

export type CartActionSetCustomFieldFreeShipping = {
  action: 'setCustomField';
  name: 'shippingProductSourceIds';
  value: string[];
};

export type CartActionSetCustomFieldWithSession = {
  action: 'setCustomField';
  name: 'session';
  value: string;
};

export type CartActionSetCustomFieldWithCouponsLimit = {
  action: 'setCustomField';
  name: 'couponsLimit';
  value: number;
};

export type CartActionRemoveCustomLineItem = {
  action: 'removeCustomLineItem';
  customLineItemId: string;
};

export type CartActionAddCustomLineItem = {
  action: 'addCustomLineItem';
  name: unknown;
  quantity: number;
  money: TypedMoney;
  slug: string;
  taxCategory: Pick<TaxCategory, 'id'>;
};

export type CartActionSetDirectDiscounts = {
  action: 'setDirectDiscounts';
  discounts: { value: CartDiscountValueDraft; target: CartDiscountTarget }[];
};

export type CartActionAddLineItem = {
  action: 'addLineItem';
  sku: string;
  quantity: number;
  distributionChannel: ChannelReference;
  externalTotalPrice?: {
    price: TypedMoney;
    totalPrice: TypedMoney;
  };
  custom?: {
    typeKey: 'lineItemCodesType';
    fields: {
      applied_codes: string[];
    };
  };
};

export type CartActionRemoveLineItem = {
  action: 'removeLineItem';
  lineItemId: string;
  quantity: number;
};

export type CartActionSetLineItemCustomField = {
  action: 'setLineItemCustomField';
  lineItemId: string;
  name: string;
  value?: string;
};

export type CartActionSetLineItemCustomType = {
  action: 'setLineItemCustomType';
  lineItemId: string;
  type: {
    key: 'lineItemCodesType';
  };
  fields: {
    applied_codes?: string[];
    coupon_fixed_price?: number;
  };
};

export type CartActionChangeLineItemQuantity = {
  action: 'changeLineItemQuantity';
  lineItemId: string;
  quantity: number;
};

export type CartActionRecalculate = {
  action: 'recalculate';
};

export type CartAction =
  | CartActionSetCustomType
  | CartActionSetCustomFieldWithCoupons
  | CartActionSetCustomFieldWithSession
  | CartActionRemoveCustomLineItem
  | CartActionAddCustomLineItem
  | CartActionSetDirectDiscounts
  | CartActionAddLineItem
  | CartActionRemoveLineItem
  | CartActionSetLineItemCustomField
  | CartActionChangeLineItemQuantity
  | CartActionSetLineItemCustomType
  | CartActionSetCustomFieldWithCouponsLimit
  | CartActionSetCustomFieldFreeShipping
  | CartActionRecalculate;

export type DataToRunCartActionsBuilder = {
  initialActions: CartAction[];
  availablePromotions: availablePromotion[];
  applicableCoupons: StackableRedeemableResponse[];
  inapplicableCoupons: StackableRedeemableResponse[];
  newSessionKey?: string;
  totalDiscountAmount: number;
  productsToAdd: ProductToAdd[];
  couponsLimit: number;
  commerceToolsCart: CommerceToolsCart;
  cartDiscountApplyMode: CartDiscountApplyMode;
  taxCategory: TaxCategory;
};

export type CartActionsBuilder = (
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
) => CartAction[];

export const COUPON_CUSTOM_LINE_SLUG = 'Voucher, ';
