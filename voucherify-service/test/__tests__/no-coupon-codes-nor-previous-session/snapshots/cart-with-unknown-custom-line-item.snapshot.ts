import {
  CartOrigin,
  CartState,
  LineItem,
  RoundingMode,
  TaxCalculationMode,
  TaxMode,
  CustomLineItem,
  Cart,
  LocalizedString,
} from '@commercetools/platform-sdk';

export const cart = {
  id: 'cart-id',
  type: 'Cart',
  createdAt: new Date().toISOString(),
  version: 2,
  lastModifiedAt: new Date().toISOString(),
  country: 'DE',
  lineItems: [
    {
      id: 'line-item-id-1',
      productId: 'product-id',
      name: { en: 'Some product' },
      productType: { typeId: 'product-type', id: 'product-type-id' },
      productSlug: { en: 'some-product-slug' },
      variant: {
        id: 1,
        sku: 'product-sku1',
        key: 'product-key1',
        prices: [
          {
            id: 'product-prices-1-id',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
          },
        ],
      },
      price: {
        id: 'product-prices-1-id',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 26500,
          fractionDigits: 2,
        },
        country: 'DE',
      },
      quantity: 1,
      discountedPricePerQuantity: [],
      taxRate: {
        name: '19% incl.',
        amount: 0.19,
        includedInPrice: true,
        country: 'DE',
        id: 'tax-DE',
      },
      state: [{ quantity: 1, state: { typeId: 'state', id: 'state-type-id' } }],
      priceMode: 'Platform',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 26500,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 22269,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 26500,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 4231,
          fractionDigits: 2,
        },
      },
      lineItemMode: 'Standard',
    },
  ] as LineItem[],
  customLineItems: [
    {
      id: 'custom-unknown-line-item-1',
      name: { en: 'Custom unknown line' } as LocalizedString,
      quantity: 1,
      money: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 10000,
        fractionDigits: 2,
      },
      slug: 'custom-unknown-line-item',
    } as CustomLineItem,
  ],
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 26500,
    fractionDigits: 2,
  },
  cartState: 'Active' as CartState,
  taxMode: <TaxMode>{},
  taxRoundingMode: <RoundingMode>{},
  taxCalculationMode: <TaxCalculationMode>{},
  refusedGifts: [],
  origin: <CartOrigin>{},
  custom: {
    type: { typeId: 'type', id: '5aa76235-9d61-41c7-9d57-278b2bcc2f75' },
    fields: { discount_codes: [] },
  },
} as Cart;
