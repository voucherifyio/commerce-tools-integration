import { Cart } from '@commercetools/platform-sdk';

export const cart = {
  type: 'Cart',
  id: '0210461a-c33b-4117-a15e-73464030b9fb',
  version: 288,
  versionModifiedAt: '2023-05-04T16:39:41.101Z',
  lastMessageSequenceNumber: 1,
  createdAt: '2023-05-04T12:58:58.689Z',
  lastModifiedAt: '2023-05-04T16:39:41.101Z',
  lastModifiedBy: {
    clientId: 'Ja9krcBoQNavB-PgzwxhxDd6',
    isPlatformClient: false,
    anonymousId: '33546f2c-4b8e-4c84-b444-cfbb036076f6',
  },
  createdBy: {
    clientId: 'Ja9krcBoQNavB-PgzwxhxDd6',
    isPlatformClient: false,
    anonymousId: '33546f2c-4b8e-4c84-b444-cfbb036076f6',
  },
  anonymousId: '33546f2c-4b8e-4c84-b444-cfbb036076f6',
  lineItems: [
    {
      id: '95e44b0d-12cc-4f6f-a202-754c1368b231',
      productId: '1001f4b0-5bd2-496b-8678-492f6dacac92',
      productKey: '81200',
      name: { en: 'Coat Aspesi blue', de: 'Mantel Aspesi blau' },
      productType: {
        typeId: 'product-type',
        id: '19e829f9-a5dd-41d7-93bb-6c1d84a43b23',
      },
      productSlug: {
        en: 'aspesi-coat-I502997385098-blue',
        de: 'aspesi-mantel-I502997385098-blau',
      },
      variant: {
        id: 1,
        sku: 'M0E20000000ECTT',
        key: 'M0E20000000ECTT',
        prices: [
          {
            id: '62052dd2-ccdc-469d-962b-4ebb813c8239',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 53625,
              fractionDigits: 2,
            },
          },
          {
            id: '3871fb5b-417e-476f-8295-3c5a796a4125',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 35164,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '1f839085-0564-4261-9674-b324c7054c5a',
            },
          },
          {
            id: '8fbf9063-7584-4f4e-9a60-2fdec3806977',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 53625,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: 'c97372d7-0e5a-428f-b6f5-5bb7d42c77b8',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 35164,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '1f839085-0564-4261-9674-b324c7054c5a',
            },
          },
          {
            id: '17ca20cb-b8a5-4323-a6f5-60cb1837aebd',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 42900,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: '3694449e-8477-434d-b046-8b6278479399',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 42900,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: '00dc7e87-1832-4341-80f5-ab77dec263c4',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 42900,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: '1132b05c-65ab-4839-9af6-2ac544645fbe',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 44616,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'a51b91a6-2fa4-49e6-ad27-3ecd6526fcad',
            },
          },
          {
            id: '568b4dd8-f4a7-4d71-96a1-6c55e299c3c3',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 52552,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '0b259a0d-f6e9-4eb7-ab4a-c997328b0127',
            },
          },
          {
            id: '280d2f7c-0c4c-425a-bb51-fb917656c88a',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 42042,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'b0d130b2-6c21-4e5c-9600-f79e1516e64a',
            },
          },
          {
            id: '5f5c2e5e-cd22-4003-9471-fc50811dc1a0',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 39468,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '8790870b-8a65-464a-b767-bda38e3887fb',
            },
          },
          {
            id: '6f68a5ff-4f99-493d-80b3-e20845db65d1',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 43329,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '423d4486-5731-4427-903d-c4fdf309b6a9',
            },
          },
          {
            id: '2479b26e-5f20-42ce-8e0c-144eaa890189',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 44616,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'cdf3e734-df10-4efa-8bff-08cd396548d7',
            },
          },
          {
            id: '1970e757-b07e-4c16-91b2-4bd81cdcfc3d',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 52552,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: 'cf997466-c9ca-4dcd-a780-41cafa89d3e0',
            },
          },
          {
            id: '03ec1634-16dc-4fb1-a233-d0a946910b96',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 42042,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '962b09c0-4847-4d08-a697-c7e9e9db963b',
            },
          },
          {
            id: '7151677c-ce2b-4b95-bb1f-16bb05489fbf',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 39468,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'de5ac414-c986-44d5-b997-8bdd03b31d0f',
            },
          },
          {
            id: 'df24df88-5eda-45de-9edf-2f1e298e6073',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 43329,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'ea569a27-1c87-4c0f-94c5-205a7d60f2e2',
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/081200_1_large.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          { name: 'articleNumberManufacturer', value: 'I502 9973 85098' },
          { name: 'articleNumberMax', value: '81200' },
          { name: 'matrixId', value: 'M0E20000000ECTT' },
          { name: 'baseId', value: '81200' },
          { name: 'designer', value: { key: 'aspesi', label: 'Aspesi' } },
          { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
          { name: 'commonSize', value: { key: 'xxs', label: 'XXS' } },
          { name: 'size', value: 'XXS' },
          {
            name: 'color',
            value: {
              key: 'blue',
              label: { de: 'blau', it: 'blu', en: 'blue' },
            },
          },
          { name: 'colorFreeDefinition', value: { en: 'blue', de: 'blau' } },
          { name: 'style', value: { key: 'business', label: 'business' } },
          { name: 'gender', value: { key: 'men', label: 'Herren' } },
          { name: 'season', value: 's15' },
        ],
        assets: [],
      },
      price: {
        id: '17ca20cb-b8a5-4323-a6f5-60cb1837aebd',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 42900,
          fractionDigits: 2,
        },
        country: 'DE',
      },
      quantity: 9,
      discountedPricePerQuantity: [],
      taxRate: {
        name: '19% incl.',
        amount: 0.19,
        includedInPrice: true,
        country: 'DE',
        id: 'JV9pQ1cx',
        subRates: [],
      },
      addedAt: '2023-05-04T12:58:58.764Z',
      lastModifiedAt: '2023-05-04T14:46:14.910Z',
      state: [
        {
          quantity: 9,
          state: {
            typeId: 'state',
            id: 'ec8c7ea7-d579-4dba-ae12-c961df230b97',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 386100,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 324454,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 386100,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 61646,
          fractionDigits: 2,
        },
      },
      custom: {
        type: { typeId: 'type', id: 'a1c08d6b-c4f8-4d33-94fa-c4757e7edc1f' },
        fields: {},
      },
    },
  ],
  cartState: 'Active',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 386100,
    fractionDigits: 2,
  },
  taxedPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 324454,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 386100,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 61646,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 61646,
      fractionDigits: 2,
    },
  },
  country: 'DE',
  shippingMode: 'Single',
  shippingAddress: { country: 'DE' },
  shipping: [],
  customLineItems: [],
  discountCodes: [],
  directDiscounts: [],
  custom: {
    type: { typeId: 'type', id: '9603a5d1-97db-496d-b407-16538b04c6ee' },
    fields: {
      couponsLimit: 5,
      discount_codes: [
        '{"status":"AVAILABLE","code":"promo_KYEi83317YMVDRhczWpLyqCJ","type":"promotion_tier"}',
        '{"status":"AVAILABLE","banner":"5$offHP","code":"promo_4h9d39HcCXyKknFujOCe4BjU","type":"promotion_tier"}',
        '{"status":"AVAILABLE","code":"promo_8JQIchibW7SzJd2Fh8x2GJEw","type":"promotion_tier"}',
        '{"status":"AVAILABLE","banner":"aaaa","code":"promo_cE3TcfsbD37VrzFklfNrN8R0","type":"promotion_tier"}',
        '{"code":"10off","status":"NEW"}',
      ],
      shippingProductSourceIds: [],
      session: 'ssn_37jZZRu6HyYcNkC7Y4PyHxpNWZibBye2',
    },
  },
  inventoryMode: 'None',
  taxMode: 'Platform',
  taxRoundingMode: 'HalfEven',
  taxCalculationMode: 'LineItemLevel',
  deleteDaysAfterLastModification: 90,
  refusedGifts: [],
  origin: 'Customer',
  itemShippingAddresses: [],
  totalLineItemQuantity: 9,
} as Cart;
