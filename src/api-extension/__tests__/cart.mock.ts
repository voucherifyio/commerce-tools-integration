import {
  CartOrigin,
  CartState,
  CustomFields,
  LineItem,
  RoundingMode,
  TaxCalculationMode,
  TaxMode,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { Coupon } from '../coupon';

export const DEFAULT_ITEM_PRICE = 26500;
export const defaultTypeId = '5aa76235-9d61-41c7-9d57-278b2bcc2f75';

export function buildPriceValue(value, currency = 'EUR'): TypedMoney {
  return {
    type: 'centPrecision',
    currencyCode: currency,
    centAmount: value,
    fractionDigits: 2,
  };
}

export let lineItemCounter = 0;

export const createLineItem = (
  props: CreateLineItemProps = {
    productId: 'product-id',
    name: 'Some product',
    sku: 'product-sku1',
    price: DEFAULT_ITEM_PRICE,
    netPrice: 22269,
    vatValue: 4231,
    quantity: 1,
  },
) =>
  ({
    id: `line-item-id-${++lineItemCounter}`,
    productId: props.productId,
    name: {
      en: props.name,
    },
    productType: {
      typeId: 'product-type',
      id: 'product-type-id',
    },
    productSlug: {
      en: 'some-product-slug',
    },
    variant: {
      id: 1,
      sku: props.sku,
      key: 'product-key1',
      prices: [
        {
          id: 'product-prices-1-id',
          value: buildPriceValue(props.price, 'EUR'),
        },
      ],
    },
    price: {
      id: 'product-prices-1-id',
      value: buildPriceValue(props.price, 'EUR'),
      country: 'DE',
    },
    quantity: props.quantity,
    discountedPricePerQuantity: [],
    taxRate: {
      name: '19% incl.',
      amount: 0.19,
      includedInPrice: true,
      country: 'DE',
      id: 'tax-DE',
    },
    state: [
      {
        quantity: props.quantity,
        state: {
          typeId: 'state',
          id: 'state-type-id',
        },
      },
    ],
    priceMode: 'Platform',
    totalPrice: buildPriceValue(props.price, 'EUR'),
    taxedPrice: {
      totalNet: buildPriceValue(props.netPrice, 'EUR'),
      totalGross: buildPriceValue(props.price, 'EUR'),
      totalTax: buildPriceValue(props.vatValue, 'EUR'),
    },
    lineItemMode: 'Standard',
  } as LineItem);

export interface CreateLineItemProps {
  productId?: string;
  name?: string;
  sku?: string;
  price?: number;
  netPrice?: number;
  vatValue?: number;
  quantity?: number;
}

export const defaultCart = () => ({
  id: 'cart-id',
  type: 'Cart',
  createdAt: new Date().toISOString(),
  version: 1,
  lastModifiedAt: new Date().toISOString(),
  country: 'DE',
  lineItems: [createLineItem()],
  customLineItems: [],
  totalPrice: buildPriceValue(DEFAULT_ITEM_PRICE, 'EUR'),
  cartState: 'Active' as CartState,
  taxMode: <TaxMode>{},
  taxRoundingMode: <RoundingMode>{},
  taxCalculationMode: <TaxCalculationMode>{},
  refusedGifts: [],
  origin: <CartOrigin>{},
  custom: <CustomFields>{
    type: {
      typeId: 'type',
      id: defaultTypeId,
    },
    fields: {},
  },
});

export const setupCouponCodes = (cart, ...coupons: Coupon[]) => {
  cart.custom = {
    type: {
      typeId: 'type',
      id: defaultTypeId,
    },
    fields: {
      discount_codes: coupons.map((coupon) => JSON.stringify(coupon)),
    },
  };
};

declare type itemAmountProvider = (item: LineItem) => number;

export const doubleFirstLineItem = (cart) => {
  const item = cart.lineItems[0];
  item.quantity *= 2;
  item.state[0].quantity *= 2;
  item.totalPrice.centAmount *= 2;
  item.taxedPrice.totalNet.centAmount *= 2;
  item.taxedPrice.totalGross.centAmount *= 2;
  item.taxedPrice.totalTax.centAmount *= 2;

  const sum = (provider: itemAmountProvider) =>
    cart.lineItems.reduce(
      (total: number, item: LineItem) => total + provider(item),
      0,
    );
  cart.totalPrice.centAmount = sum((item) => item.totalPrice.centAmount);
};
