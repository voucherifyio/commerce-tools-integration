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
      quantity: 2,
      discountedPricePerQuantity: [],
      taxRate: {
        name: '19% incl.',
        amount: 0.19,
        includedInPrice: true,
        country: 'DE',
        id: 'tax-DE',
      },
      state: [{ quantity: 2, state: { typeId: 'state', id: 'state-type-id' } }],
      priceMode: 'Platform',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 53000,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 44538,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 53000,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 8462,
          fractionDigits: 2,
        },
      },
      lineItemMode: 'Standard',
    },
  ] as LineItem[],
  customLineItems: [],
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 53000,
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
      discount_codes: [
        '{"code":"PERC10","status":"APPLIED","value":2650}',
        '{"code":"AMOUNT20","status":"APPLIED","value":2000}',
      ],
      session: 'existing-session-id',
    },
  },
} as Cart;
