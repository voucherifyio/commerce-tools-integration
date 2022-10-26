import {
  Cart,
  CartOrigin,
  CartState,
  LineItem,
  RoundingMode,
  TaxCalculationMode,
  TaxMode,
} from '@commercetools/platform-sdk';

export const cart = {
  type: 'Cart',
  id: '3527d150-afd2-4f73-98e3-1bd7f7733933',
  version: 40,
  versionModifiedAt: '2022-10-25T10:21:30.048Z',
  lastMessageSequenceNumber: 1,
  createdAt: '2022-10-25T10:20:48.804Z',
  lastModifiedAt: '2022-10-25T10:21:30.048Z',
  lastModifiedBy: {
    clientId: '95cBLHwyNrXOqDmPYmECumU5',
    isPlatformClient: false,
    anonymousId: '7ecc8b23-a5e6-4d04-82ff-2e8fd3bc550b',
  },
  createdBy: {
    clientId: '95cBLHwyNrXOqDmPYmECumU5',
    isPlatformClient: false,
    anonymousId: '7ecc8b23-a5e6-4d04-82ff-2e8fd3bc550b',
  },
  anonymousId: '7ecc8b23-a5e6-4d04-82ff-2e8fd3bc550b',
  lineItems: [
    {
      id: '3496ae8b-9470-4a3b-a904-db9355f2c4f9',
      productId: '260d2585-daef-4c11-9adb-1b90099b7ae8',
      productKey: '78893',
      name: { en: 'Pants Jacob Cohen green', de: 'Hose Jacob Cohen grün' },
      productType: {
        typeId: 'product-type',
        id: '8cecf268-aa3c-48e1-9ebc-36aee51c08fa',
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
          {
            id: 'dfdb4159-6468-456d-82bf-08c599704097',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 33125,
              fractionDigits: 2,
            },
          },
          {
            id: '75f0c998-ec6e-4a40-84a7-708352576b4f',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 21721,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: 'a055c9b7-4ead-4374-9040-ed03a7dc7467',
            },
          },
          {
            id: 'c96add08-754e-4592-b0eb-9098a316dbc1',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 33125,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: '7c411e37-bcfd-4c44-9854-b39cc1aa8e4f',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 21721,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: 'a055c9b7-4ead-4374-9040-ed03a7dc7467',
            },
          },
          {
            id: '47040b48-8b2a-44d4-8793-9e724422520f',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: 'aa508846-be63-44e0-a97f-d9d52fc14aac',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: 'd35e91b5-ed02-40f0-aeea-b58ea466d589',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: '3cb542b6-88b3-4308-a999-421d5b291d2e',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 25970,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'bc6241d9-dc2c-4287-ab28-1c3d0aa3db64',
            },
          },
          {
            id: 'c4cdf465-b90d-49fc-9276-b18c4f6fc72e',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 30144,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: 'a3979371-382f-473e-963e-ebee1cd647ae',
            },
          },
          {
            id: '0c5f34c1-b01d-4d74-9307-7c154e36f9d7',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 28620,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '3a458b66-f612-4389-8e40-5b48664b2fb1',
            },
          },
          {
            id: 'a428058f-d393-457d-bf20-ee59a7111e9c',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24910,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '1974467a-4a9e-432a-88cd-cec1cb72680b',
            },
          },
          {
            id: 'ef81e7bd-c939-4d9e-aea7-24960d6785b8',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29150,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '6eeb0ba1-ebe5-4c5e-a7b0-1e31ec3a820e',
            },
          },
          {
            id: '11c16cbd-0540-48c1-9e58-df8712a1f317',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 25970,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'cc501e07-1784-4a9e-af69-f7aa6f7f485e',
            },
          },
          {
            id: '792162a0-4fa9-4db4-b793-ad79bd5abcfa',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 30144,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: 'f33944e0-6a98-4cb4-9783-05d02fd9b1c3',
            },
          },
          {
            id: 'f3ff3ef3-bb2c-4272-b31f-37f4cba2df13',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 28620,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '180cb417-67d8-4a8e-9361-2366b05b78a4',
            },
          },
          {
            id: '0b171b79-e63e-4807-a6bc-876de4c2fc53',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24910,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '54d06954-c5b4-47e5-b15e-03e0f552c329',
            },
          },
          {
            id: '454ca931-0dcb-44e0-9ba1-76d8a0ad96c5',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 29150,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '7c45abf1-9d6b-4654-85c7-6ae4f2784488',
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/078893_1_large.jpg',
            dimensions: { w: 0, h: 0 },
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
          {
            name: 'designer',
            value: { key: 'jacobcohen', label: 'Jacob Cohen' },
          },
          { name: 'madeInItaly', value: { key: 'yes', label: 'yes' } },
          { name: 'commonSize', value: { key: 'xs', label: 'XS' } },
          { name: 'size', value: '24' },
          {
            name: 'color',
            value: {
              key: 'green',
              label: { it: 'verde', en: 'green', de: 'grün' },
            },
          },
          { name: 'colorFreeDefinition', value: { en: 'green', de: 'grün' } },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'men', label: 'Herren' } },
          { name: 'season', value: 's15' },
        ],
        assets: [],
      },
      price: {
        id: '47040b48-8b2a-44d4-8793-9e724422520f',
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
        id: 'OJMOqohw',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2022-10-25T10:20:48.877Z',
      lastModifiedAt: '2022-10-25T10:20:48.877Z',
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: 'a14fd245-0740-4eb6-9a43-0d78db7eaa93',
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
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 4231,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '7b36f7d1-7611-436e-b99c-fdc87e5137bd' },
        fields: {},
      },
    },
    {
      id: '668aede9-2aff-4c9b-ad37-cc9c79aa522a',
      productId: '260d2585-daef-4c11-9adb-1b90099b7ae8',
      productKey: '78893',
      name: { en: 'Pants Jacob Cohen green', de: 'Hose Jacob Cohen grün' },
      productType: {
        typeId: 'product-type',
        id: '8cecf268-aa3c-48e1-9ebc-36aee51c08fa',
      },
      productSlug: {
        en: 'jacob-cohen-trousers-j622-697-green',
        de: 'jacob-cohen-hose-j622-697-gruen',
      },
      variant: {
        id: 16,
        sku: 'M0E20000000DUJ6',
        key: 'M0E20000000DUJ6',
        prices: [
          {
            id: '51762046-2626-4bc2-870a-70cab59ba1f9',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 33125,
              fractionDigits: 2,
            },
          },
          {
            id: 'd26c888f-0e69-4bb9-8e0a-8cde80abf149',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 21721,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: 'a055c9b7-4ead-4374-9040-ed03a7dc7467',
            },
          },
          {
            id: '5d35800e-aeb5-477a-9260-e0fb57866417',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 33125,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: '72da3f95-6964-4374-9fe9-d9be1008d57f',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 21721,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: 'a055c9b7-4ead-4374-9040-ed03a7dc7467',
            },
          },
          {
            id: 'b10989de-aba1-4eec-af8b-47a3d2a849bf',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: '77f9c68a-3544-4036-9148-d3b53ed68c08',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: '3b9210c5-ff02-444a-912d-f462c5c82e01',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: 'f8be640b-0247-4df4-be8d-27b56d722c16',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24115,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'bc6241d9-dc2c-4287-ab28-1c3d0aa3db64',
            },
          },
          {
            id: 'bace57c2-ceb4-4388-acd3-fd18e82ad577',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29812,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: 'a3979371-382f-473e-963e-ebee1cd647ae',
            },
          },
          {
            id: 'dd03bd59-0ed1-4681-aa3f-1f86f8d62147',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24115,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '3a458b66-f612-4389-8e40-5b48664b2fb1',
            },
          },
          {
            id: 'c934f12e-f00c-4c4d-bf20-e0907058e7ff',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24645,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '1974467a-4a9e-432a-88cd-cec1cb72680b',
            },
          },
          {
            id: '767dec91-deec-4920-93cc-942612a57767',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24380,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '6eeb0ba1-ebe5-4c5e-a7b0-1e31ec3a820e',
            },
          },
          {
            id: '4586dfae-bedc-4003-8640-b0cb0e69e3d8',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24115,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'cc501e07-1784-4a9e-af69-f7aa6f7f485e',
            },
          },
          {
            id: 'ca99487e-43bf-465e-815b-7ca968e13bd6',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 29812,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: 'f33944e0-6a98-4cb4-9783-05d02fd9b1c3',
            },
          },
          {
            id: 'e2c2a7f9-6897-407f-87f7-715e9fd4fc0c',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24115,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '180cb417-67d8-4a8e-9361-2366b05b78a4',
            },
          },
          {
            id: '22515b5b-b8c4-441f-aeed-db20083e6bf7',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24645,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '54d06954-c5b4-47e5-b15e-03e0f552c329',
            },
          },
          {
            id: 'b2de0f2d-1205-407c-a1ed-c143f6069686',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24380,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '7c45abf1-9d6b-4654-85c7-6ae4f2784488',
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/078893_1_large.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          {
            name: 'articleNumberManufacturer',
            value: 'J622 COM VIN 8605 697 697',
          },
          { name: 'articleNumberMax', value: '78893' },
          { name: 'matrixId', value: 'M0E20000000DUJ6' },
          { name: 'baseId', value: '78893' },
          {
            name: 'designer',
            value: { key: 'jacobcohen', label: 'Jacob Cohen' },
          },
          { name: 'madeInItaly', value: { key: 'yes', label: 'yes' } },
          { name: 'commonSize', value: { key: 'xxxl', label: 'XXXL' } },
          { name: 'size', value: '40' },
          {
            name: 'color',
            value: {
              key: 'green',
              label: { it: 'verde', en: 'green', de: 'grün' },
            },
          },
          { name: 'colorFreeDefinition', value: { en: 'green', de: 'grün' } },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'men', label: 'Herren' } },
          { name: 'season', value: 's15' },
        ],
        assets: [],
      },
      price: {
        id: 'b10989de-aba1-4eec-af8b-47a3d2a849bf',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 26500,
          fractionDigits: 2,
        },
        country: 'DE',
      },
      quantity: 3,
      discountedPricePerQuantity: [],
      taxRate: {
        name: '19% incl.',
        amount: 0.19,
        includedInPrice: true,
        country: 'DE',
        id: 'OJMOqohw',
        subRates: [],
      },
      addedAt: '2022-10-25T10:21:10.608Z',
      lastModifiedAt: '2022-10-25T10:21:30.035Z',
      state: [
        {
          quantity: 3,
          state: {
            typeId: 'state',
            id: 'a14fd245-0740-4eb6-9a43-0d78db7eaa93',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 79500,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 66807,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 79500,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 12693,
          fractionDigits: 2,
        },
      },
      custom: {
        type: { typeId: 'type', id: '7b36f7d1-7611-436e-b99c-fdc87e5137bd' },
        fields: {
          applied_codes: [
            '{"code":"UNIT_TYPE_OFF","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":1,"totalDiscountQuantity":3}',
            '{"code":"UNIT_TYPE_OFF_2","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":2,"totalDiscountQuantity":3}',
          ],
        },
      },
    },
  ] as LineItem[],
  cartState: 'Active' as CartState,
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
      centAmount: 9576,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 26500,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
        name: 'coupon',
      },
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 16924,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 16924,
      fractionDigits: 2,
    },
  },
  country: 'DE',
  shippingMode: 'Single',
  shippingAddress: { country: 'DE' },
  shipping: [],
  customLineItems: [
    {
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: -79500,
        fractionDigits: 2,
      },
      id: '7c4f9f8a-6b68-4c5d-ae81-8d698d87759b',
      name: { en: 'Coupon codes discount', de: 'Gutscheincodes rabatt' },
      money: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: -79500,
        fractionDigits: 2,
      },
      slug: 'Voucher, ',
      quantity: 1,
      discountedPricePerQuantity: [],
      taxCategory: {
        typeId: 'tax-category',
        id: 'fe44c543-a4b6-4201-916e-e53c2a363c88',
      },
      taxRate: {
        name: 'coupon',
        amount: 0,
        includedInPrice: true,
        country: 'DE',
        id: 'sP31rL5D',
        subRates: [],
      },
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: 'a14fd245-0740-4eb6-9a43-0d78db7eaa93',
          },
        },
      ],
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -79500,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -79500,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
      },
    },
  ],
  discountCodes: [],
  directDiscounts: [],
  custom: {
    type: { typeId: 'type', id: '373dac50-e047-4fa6-85dd-d28be173437e' },
    fields: {
      couponsLimit: 5,
      shippingProductSourceIds: ['260d2585-daef-4c11-9adb-1b90099b7ae8'],
      discount_codes: [
        '{"status":"AVAILABLE","value":3180,"code":"promo_wioFo2j76hxtc9iAnkjyJFQu","type":"promotion_tier"}',
        '{"status":"AVAILABLE","value":1590,"banner":"Unlock 6% off with $500+ products","code":"promo_LoWD2lSEBMwadu3c76BXW7CD","type":"promotion_tier"}',
        '{"status":"AVAILABLE","value":899,"banner":"Add products worth $250+ for 3% discount","code":"promo_GxKYXxhRwXnjdJ29A8p9RH16","type":"promotion_tier"}',
        '{"status":"AVAILABLE","value":2000,"code":"promo_fb8H1MP2AAxM5VJUF8gl7fDS","type":"promotion_tier"}',
        '{"status":"AVAILABLE","value":1000,"code":"promo_Zf8R857P6PV421JH7cqpx24G","type":"promotion_tier"}',
        '{"code":"UNIT_TYPE_OFF","status":"APPLIED","type":"voucher","value":26500}',
        '{"code":"UNIT_TYPE_OFF_2","status":"APPLIED","type":"voucher","value":53000}',
        '{"code":"X_10%_OFF","status":"NEW"}',
      ],
      session: 'ssn_QViyAFOpt1JibmfvJNauRjZlMH1tVKVF',
      isValidationFailed: false,
    },
  },
  inventoryMode: 'None',
  taxMode: <TaxMode>{},
  taxRoundingMode: <RoundingMode>{},
  taxCalculationMode: <TaxCalculationMode>{},
  deleteDaysAfterLastModification: 90,
  refusedGifts: [],
  origin: <CartOrigin>{},
  itemShippingAddresses: [],
  totalLineItemQuantity: 4,
} as Cart;
