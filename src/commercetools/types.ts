import { CustomerGroupReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/customer-group';
import { ChannelReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/channel';
import { CartAction } from './cartActions/CartAction';

export type PriceSelector = {
  country: string;
  currencyCode: string;
  customerGroup: CustomerGroupReference;
  distributionChannels: ChannelReference[];
};

export type CartResponse = { status: boolean; actions: CartAction[] };

export enum CartDiscountApplyMode {
  CustomLineItem,
  DirectDiscount,
}
