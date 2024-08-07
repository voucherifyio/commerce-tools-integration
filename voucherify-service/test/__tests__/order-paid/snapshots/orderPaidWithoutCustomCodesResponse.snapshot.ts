import { Order } from '@commercetools/platform-sdk';

export const orderPaidWithoutCustomCodesResponse = {
  type: 'Order',
  id: '795dfe9a-8651-48d6-8b1c-3afa0cae82c7',
  version: 6,
  versionModifiedAt: '2024-06-20T12:26:40.345Z',
  lastMessageSequenceNumber: 6,
  createdAt: '2024-06-20T12:13:59.988Z',
  lastModifiedAt: '2024-06-20T12:26:40.345Z',
  lastModifiedBy: {
    isPlatformClient: true,
    user: { typeId: 'user', id: 'e617a5c4-f5a7-441f-b049-b88b5f652e5f' },
  },
  createdBy: {
    clientId: 'xk5XhnOY0sEnvWZaI6cELzDE',
    isPlatformClient: false,
    anonymousId: '1ff6d7b2-a1a1-4f63-a63b-2d80ab5b0797',
  },
  anonymousId: '1ff6d7b2-a1a1-4f63-a63b-2d80ab5b0797',
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
    taxPortions: [],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 4231,
      fractionDigits: 2,
    },
  },
  country: 'DE',
  orderState: 'Open',
  paymentState: 'Paid',
  syncInfo: [],
  returnInfo: [],
  taxMode: 'Platform',
  inventoryMode: 'None',
  taxRoundingMode: 'HalfEven',
  taxCalculationMode: 'LineItemLevel',
  origin: 'Customer',
  shippingMode: 'Single',
  shippingAddress: {
    firstName: 'ads',
    lastName: 'ads',
    streetName: 'ads',
    postalCode: '123',
    city: 'ds',
    country: 'DE',
    email: '1@o2.pl',
  },
  shipping: [],
  lineItems: [
    {
      id: 'd0d09989-7c65-4798-b4cf-098f72201e4b',
      productId: '2a0a5b55-2b9c-4572-8074-bbcefdacf390',
      productKey: '78893',
      name: { en: 'Pants Jacob Cohen green', de: 'Hose Jacob Cohen grün' },
      productType: {
        typeId: 'product-type',
        id: '9730a637-875e-4810-93aa-a8e56cffabe1',
        version: 1,
      },
      productSlug: {
        en: 'jacob-cohen-trousers-j622-697-green',
        de: 'jacob-cohen-hose-j622-697-gruen',
      },
      variant: {
        id: 1,
        sku: 'M0E20000000DUIR',
        key: 'M0E20000000DUIR',
        prices: [
          { id: 'df3d1ce2-f29c-426f-9dcd-516bcda6de49', value: [Object] },
          {
            id: '2724701f-10ca-4df6-a202-b15c8069b2d3',
            value: [Object],
            customerGroup: [Object],
          },
          {
            id: '9bff832b-3beb-4d12-b172-888b8291f592',
            value: [Object],
            country: 'US',
          },
          {
            id: 'cd2bab21-ec4d-41cc-bc59-4320f000f51a',
            value: [Object],
            customerGroup: [Object],
          },
          {
            id: '04431c6f-4492-4af4-ae1b-a4d625fb5d46',
            value: [Object],
            country: 'DE',
          },
          {
            id: 'f07b6fca-988e-494b-a2cd-12d69c7e44ff',
            value: [Object],
            country: 'IT',
          },
          {
            id: '28951fef-9595-46a9-8abc-2764b99d0ebf',
            value: [Object],
            country: 'GB',
          },
          {
            id: '9eeb4ff4-367c-4868-b994-f5691d8d3d15',
            value: [Object],
            country: 'DE',
            channel: [Object],
          },
          {
            id: '0230a70a-5e67-4806-9398-9b7487f3e7da',
            value: [Object],
            channel: [Object],
          },
          {
            id: '3380ee50-7db3-4a37-a5ec-507db1121208',
            value: [Object],
            country: 'DE',
            channel: [Object],
          },
          {
            id: '8ddb3a98-7f21-4c4e-9693-cad5d15cf8af',
            value: [Object],
            country: 'DE',
            channel: [Object],
          },
          {
            id: 'd8a1a64e-d0af-4430-8f47-a4efa7e3cbe7',
            value: [Object],
            country: 'DE',
            channel: [Object],
          },
          {
            id: '01b5655d-f509-4cd9-9860-bbc65aad708f',
            value: [Object],
            country: 'US',
            channel: [Object],
          },
          {
            id: '2cc19517-fb23-4966-8af9-ee7fc5f15a82',
            value: [Object],
            channel: [Object],
          },
          {
            id: '08214e59-0996-4ecc-ace2-3da554737407',
            value: [Object],
            country: 'US',
            channel: [Object],
          },
          {
            id: 'ee140832-7f85-4886-87fc-735d3aeb9a01',
            value: [Object],
            country: 'US',
            channel: [Object],
          },
          {
            id: '984c72a6-e25f-4d13-9189-3a50be3a6192',
            value: [Object],
            country: 'US',
            channel: [Object],
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/078893_1_large.jpg',
            dimensions: [Object],
          },
        ],
        attributes: [
          {
            name: 'articleNumberManufacturer',
            value: 'J622 COM VIN 8605 697 697',
          },
          { name: 'articleNumberMax', value: '78893' },
          { name: 'matrixId', value: 'M0E20000000DUIR' },
          { name: 'baseId', value: '78893' },
          { name: 'designer', value: [Object] },
          { name: 'madeInItaly', value: [Object] },
          { name: 'commonSize', value: [Object] },
          { name: 'size', value: '24' },
          { name: 'color', value: [Object] },
          { name: 'colorFreeDefinition', value: [Object] },
          { name: 'style', value: [Object] },
          { name: 'gender', value: [Object] },
          { name: 'season', value: 's15' },
        ],
        assets: [],
      },
      price: {
        id: '04431c6f-4492-4af4-ae1b-a4d625fb5d46',
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
        id: '8QjXEInm',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2024-06-20T12:13:41.589Z',
      lastModifiedAt: '2024-06-20T12:13:41.589Z',
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: '960f9f2f-a798-49dd-afd5-7cc89a4f3ff6',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
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
        taxPortions: [{ rate: 0.19, amount: [Object], name: '19% incl.' }],
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 4231,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '83213f56-58cb-4dd2-8ff3-0fb45c04cb10' },
        fields: {},
      },
    },
  ],
  customLineItems: [],
  transactionFee: true,
  discountCodes: [],
  directDiscounts: [],
  cart: { typeId: 'cart', id: '795e923e-8fad-46a2-a69a-32be65fa0191' },
  custom: {
    type: { typeId: 'type', id: 'f19c3900-a6d5-4f73-9f12-4e09d2cfd792' },
    fields: {
      couponsLimit: 5,
      discount_codes: [],
      shippingProductSourceIds: [],
    },
  },
  billingAddress: {
    firstName: 'ads',
    lastName: 'ads',
    streetName: 'ads',
    postalCode: '123',
    city: 'ds',
    country: 'DE',
    email: '1@o2.pl',
  },
  itemShippingAddresses: [],
  refusedGifts: [],
} as unknown as Order;
