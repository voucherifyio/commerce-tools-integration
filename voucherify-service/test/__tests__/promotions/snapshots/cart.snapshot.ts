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
  id: 'e88e7200-48f1-4bbb-b0a1-af26aace78d8',
  version: 781,
  versionModifiedAt: '2023-05-08T17:16:55.094Z',
  lastMessageSequenceNumber: 1,
  createdAt: '2023-05-08T10:51:56.256Z',
  lastModifiedAt: '2023-05-08T17:16:55.094Z',
  lastModifiedBy: {
    clientId: 'IgyXSgHXoGs0DrmK2opSEDml',
    isPlatformClient: false,
    anonymousId: '42825257-628c-491f-8674-0f6f74a49605',
  },
  createdBy: {
    clientId: 'IgyXSgHXoGs0DrmK2opSEDml',
    isPlatformClient: false,
    anonymousId: '42825257-628c-491f-8674-0f6f74a49605',
  },
  anonymousId: '42825257-628c-491f-8674-0f6f74a49605',
  lineItems: [
    {
      id: '88b37247-185f-4234-af67-d167674da909',
      productId: '7b41812d-7f3e-48ba-bc6e-c607232d025f',
      productKey: '78893',
      name: { en: 'Pants Jacob Cohen green', de: 'Hose Jacob Cohen grün' },
      productType: {
        typeId: 'product-type',
        id: 'b54929c3-e57f-413e-a1ce-a5011f73741d',
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
            id: 'b5d83d04-9238-4223-a0e7-de0e670a1411',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 33125,
              fractionDigits: 2,
            },
          },
          {
            id: '3e43ca16-f8f3-4edf-9ab3-3b9372d7c4db',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 21721,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: 'f6918ed7-10f3-4f3e-9392-b9e48d9da953',
            },
          },
          {
            id: '5008f926-e5a2-4d85-89da-c488cfda89ec',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 33125,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: '6631c100-a504-4b95-ad4f-9b5e59cfd678',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 21721,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: 'f6918ed7-10f3-4f3e-9392-b9e48d9da953',
            },
          },
          {
            id: 'af3d7584-2dd3-4fb4-9931-0dbd1650310e',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: '541391db-b7ce-4afb-aebb-1601db2af3af',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: 'f04f111f-983e-4a2f-8302-8c7a1d3b0e3e',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26500,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: 'c27c2f14-74c0-4c4b-958c-1ec4af6dc1f2',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 25970,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'b3b39135-e693-46a4-9006-675a9cd7d49f',
            },
          },
          {
            id: 'b22d4019-1e45-4d38-a898-d5c2fea05efa',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 30144,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '9e3f18fb-65d7-4a1d-a569-3c2c384cdf61',
            },
          },
          {
            id: 'a0251b3b-5932-4774-929b-fd694f246ae6',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 28620,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'bd9038dd-644c-4519-b1de-0a03220dce52',
            },
          },
          {
            id: 'b652b797-db46-4bd5-bcb0-1a36a498b679',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24910,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'd359753b-c297-491b-ab15-7410742fe6b3',
            },
          },
          {
            id: '92fb29a8-cc66-4870-9145-31a77d029b00',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29150,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '5fd54e93-b6fa-48d3-bd0f-42531f83ad0e',
            },
          },
          {
            id: 'b75bb2cf-5c24-4bbc-9e42-c1487c1ba7aa',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 25970,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '31629395-ea08-4cae-8e6e-b3eea77424ae',
            },
          },
          {
            id: '936d872f-cd21-4ef6-bd67-5727029d651b',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 30144,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '7a10b24d-8b57-4f24-9ff4-f6ab922cac62',
            },
          },
          {
            id: '54a26385-ef7a-4443-b66e-bfe9ea05d6ce',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 28620,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '034dcc55-5889-4823-8f08-96569a4ae4ce',
            },
          },
          {
            id: 'b64db31a-cf70-40a3-9e0a-10da9209ea19',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24910,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '117aa7d8-e4bf-462e-8752-fe1e1a3fce1f',
            },
          },
          {
            id: '09331269-a089-45c5-b3c8-442d6401d805',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 29150,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'ac551a56-376b-4e86-b666-1c0e3abe46ef',
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
        id: 'af3d7584-2dd3-4fb4-9931-0dbd1650310e',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 26500,
          fractionDigits: 2,
        },
        country: 'DE',
      },
      quantity: 4,
      discountedPricePerQuantity: [],
      taxRate: {
        name: '19% incl.',
        amount: 0.19,
        includedInPrice: true,
        country: 'DE',
        id: 'debXBG_t',
        subRates: [],
      },
      // perMethodTaxRate: [],
      addedAt: '2023-05-08T10:51:56.347Z',
      lastModifiedAt: '2023-05-08T17:14:40.030Z',
      state: [
        {
          quantity: 4,
          state: {
            typeId: 'state',
            id: '5e85b7eb-0aaf-4178-bf04-77af173f5e75',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 106000,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 89076,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 106000,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 16924,
          fractionDigits: 2,
        },
      },
      // taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '4aff0417-79e1-47ef-9724-aa9697f62627' },
        fields: {},
      },
    },
  ] as unknown as LineItem[],
  cartState: 'Active' as CartState,
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 106000,
    fractionDigits: 2,
  },
  taxedPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 89076,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 106000,
      fractionDigits: 2,
    },
    taxPortions: [
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
  customLineItems: [],
  discountCodes: [],
  directDiscounts: [],
  custom: {
    type: { typeId: 'type', id: '9f6c1131-dad8-4722-8d63-0ccc71cfd58c' },
    fields: {
      couponsLimit: 5,
      discount_codes: [
        '{"status":"AVAILABLE","value":1000,"banner":"Promotion A2 tier 1","code":"promo_LP8KQR34UHK5b1UWeBH62FS2","type":"promotion_tier"}',
        '{"status":"NEW","value":1000,"banner":"Promotion A1 tier 1","code":"promo_Y4lMzNB8H69GojnLyF3hJZXP","type":"promotion_tier"}',
        '{"status":"AVAILABLE","value":10600,"banner":"Over 300EUR off","code":"promo_O2WtQixJ6WbXy0KRNG24S51Y","type":"promotion_tier"}',
      ],
      shippingProductSourceIds: [],
      session: 'ssn_sP4wyA8d2tGzD6Nt4zVBSLOjoLZB2P3d',
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
