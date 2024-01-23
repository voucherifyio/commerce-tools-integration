import { CustomerGroupReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/customer-group';
import { ChannelReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/channel';
import { CartAction } from './store-actions/cart-update-actions/CartAction';
import {
  OrdersItem,
  StackableRedeemableResultDiscountUnit,
} from '@voucherify/sdk';
import { Product } from '@commercetools/platform-sdk';

export type PriceSelector = {
  country: string;
  currencyCode: string;
  customerGroup?: CustomerGroupReference;
  distributionChannels?: ChannelReference[];
};

export type CartResponse = { status: boolean; actions: CartAction[] };

export enum CartDiscountApplyMode {
  CustomLineItem,
  DirectDiscount,
}

export interface ProductWithCurrentPriceAmountInterface extends Product {
  currentPriceAmount: number;
  unit: StackableRedeemableResultDiscountUnit;
  item: OrdersItem;
}
