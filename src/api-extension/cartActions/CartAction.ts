import { Cart, TaxCategory, TypedMoney } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { ChannelReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/channel';

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

export type CartActionSetCustomFieldWithSession = {
  action: 'setCustomField';
  name: 'session';
  value: string;
};

export type CartActionRemoveCustomLineItem = {
  action: 'removeCustomLineItem';
  customLineItemId: string;
};

export type CartActionAddCustomLineItem = {
  action: 'addCustomLineItem';
  name: {
    en: string;
  };
  quantity: number;
  money: TypedMoney;
  slug: string;
  taxCategory: Pick<TaxCategory, 'id'>;
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
    applied_codes: string[];
  };
};

export type CartActionChangeLineItemQuantity = {
  action: 'changeLineItemQuantity';
  lineItemId: string;
  quantity: number;
};

export type CartAction =
  | CartActionSetCustomType
  | CartActionSetCustomFieldWithCoupons
  | CartActionSetCustomFieldWithSession
  | CartActionRemoveCustomLineItem
  | CartActionAddCustomLineItem
  | CartActionAddLineItem
  | CartActionRemoveLineItem
  | CartActionSetLineItemCustomField
  | CartActionChangeLineItemQuantity
  | CartActionSetLineItemCustomType;

export type CartActionsBuilder = (
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
) => CartAction[];

export const COUPON_CUSTOM_LINE_NAME_PREFIX = 'Voucher, ';
