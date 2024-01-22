import {
  CartOrigin,
  CartState,
  LineItem,
  RoundingMode,
  TaxCalculationMode,
  TaxMode,
  Cart,
} from '@commercetools/platform-sdk';

export const cart = {
  id: 'cart-id',
  type: 'Cart',
  createdAt: new Date().toISOString(),
  version: 20,
  lastModifiedAt: new Date().toISOString(),
  country: 'DE',
  lineItems: [
    {
      id: 'line-item-id-5',
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
    {
      id: 'line-item-id-6',
      productId: '7c66ebdb-446d-4ea5-846e-80463a356ef2',
      name: { en: 'Free product' },
      productType: { typeId: 'product-type', id: 'product-type-id' },
      productSlug: { en: 'some-product-slug' },
      variant: {
        id: 1,
        sku: 'gift-sku-id',
        key: 'product-key1',
        prices: [
          {
            id: 'product-prices-1-id',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 6500,
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
          centAmount: 6500,
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
        centAmount: 6500,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 5462,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 6500,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1038,
          fractionDigits: 2,
        },
      },
      lineItemMode: 'Standard',
      custom: {
        fields: {
          applied_codes: ['{"code":"ADD_GIFT","type":"UNIT","quantity":1}'],
        },
      },
    },
  ] as LineItem[],
  customLineItems: [],
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
    fields: {
      discount_codes: ['{"status":"APPLIED","code":"ADD_GIFT","value":6500}'],
      session: 'existing-session-id',
    },
  },
  amount: null,
  discount_amount: 6500,
} as Cart;
