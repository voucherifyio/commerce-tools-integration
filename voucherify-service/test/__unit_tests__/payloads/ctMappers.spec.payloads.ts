export const getSimpleMetadataForOrderRawOrder = {
  type: 'Order',
  id: '0e33558f-6e2e-4756-8cb0-379cf68c3ec1',
  version: 2,
  versionModifiedAt: '2023-06-01T16:09:40.217Z',
  lastMessageSequenceNumber: 2,
  createdAt: '2023-06-01T16:09:40.094Z',
  lastModifiedAt: '2023-06-01T16:09:40.094Z',
  lastModifiedBy: {
    isPlatformClient: true,
    user: { typeId: 'user', id: 'eb521f4b-5a8b-4958-ba9c-93dd29d7c363' },
  },
  createdBy: {
    clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
    isPlatformClient: false,
    anonymousId: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
  },
  anonymousId: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 29600,
    fractionDigits: 2,
  },
  taxedPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 20100,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 29600,
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
          centAmount: 9500,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 9500,
      fractionDigits: 2,
    },
  },
  country: 'DE',
  taxedShippingPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
  },
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
  shippingInfo: {
    shippingMethodName: 'Standard EU',
    price: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    shippingRate: {
      price: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 300,
        fractionDigits: 2,
      },
      freeAbove: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 20000,
        fractionDigits: 2,
      },
      tiers: [],
    },
    taxRate: {
      name: '19% incl.',
      amount: 0.19,
      includedInPrice: true,
      country: 'DE',
      id: 'n9ENOU2i',
      subRates: [],
    },
    taxCategory: {
      typeId: 'tax-category',
      id: '72f8835b-53ae-4d3b-bd3b-a17dafd26c99',
    },
    deliveries: [],
    shippingMethod: {
      typeId: 'shipping-method',
      id: '4e09f55b-f33b-47a1-a236-a9785c8da88d',
    },
    taxedPrice: {
      totalNet: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      totalGross: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      totalTax: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
    },
    shippingMethodState: 'MatchesCart',
  },
  shippingAddress: {
    firstName: 'Piotr',
    lastName: 'Zieliński',
    streetName: 'Porcelanowa',
    postalCode: '32-000',
    city: 'Kraków',
    country: 'DE',
    phone: '+48796120506',
    email: 'piotrzielinski@gmail.com',
  },
  shipping: [],
  lineItems: [
    {
      id: 'b88061f5-a3ea-44d2-aa7c-00e4e3029b78',
      productId: '73ce4f06-80ad-48e6-8b36-e7102fdc8709',
      productKey: '81338',
      name: { en: 'Jeans Cycle dark blue', de: 'Jeans Cycle dunkelblau' },
      productType: {
        typeId: 'product-type',
        id: 'f084fa3e-01bd-4ee2-8c8a-9a18764e8841',
        version: 1,
      },
      productSlug: {
        en: 'cycle-jeans-T225B0440880-darkblue',
        de: 'cycle-jeans-T225B0440880-dunkelblau',
      },
      variant: {
        id: 1,
        sku: 'M0E20000000EE54',
        key: 'M0E20000000EE54',
        prices: [
          {
            id: 'cc49dc1d-515b-4bf7-9a49-e0da4266d9dd',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 18500,
              fractionDigits: 2,
            },
          },
          {
            id: '3d14867a-66d2-4766-a05d-b66bfd258121',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 12131,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: '1728926f-e928-4eba-8aab-8338406b0f38',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 18500,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: '9e7124c7-fba6-4fe3-9b13-1262a74bf054',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 12131,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: '268bd270-188d-480e-91ce-62f5ce36cd44',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 14800,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: '79e2adaf-1f35-44cf-b6b6-959730676fe2',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 14800,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: '4a76b969-9927-4499-95f3-70ba1986d792',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 14800,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: '85475aaa-0a2a-4469-a766-1f214477c7c6',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 16132,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'd4e8a815-830f-43bf-8506-77de565bf3f3',
            },
          },
          {
            id: 'ea15846d-304b-492c-bf9a-4f203d3ce218',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 20165,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '68506b79-8d88-47ab-b77d-5b54cb6eec03',
            },
          },
          {
            id: '1f7c4b96-faa9-4042-b7b7-a06cc00659dd',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 16280,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '075f15ed-e66a-49a6-8d61-786145ac1a7a',
            },
          },
          {
            id: 'e7c79b01-130c-4e3b-8b9e-0e014a18f885',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 13468,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'ffecbfe5-a622-4e1f-8704-ac328d94cfb5',
            },
          },
          {
            id: 'bcdbfe78-1906-445d-882e-cf4431eb84df',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 13616,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'c9958b11-6151-433e-83f3-4424e6fa4ac2',
            },
          },
          {
            id: '6a68bc68-3fe4-42fe-aa84-eb9efe201a23',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 16132,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '2259d32b-2c7a-4941-842a-d81fb3c878e7',
            },
          },
          {
            id: '33958888-3989-49db-b64e-124fd35aacc4',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 20165,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '0399ae91-a3be-40ef-90cc-11ac36cf8a62',
            },
          },
          {
            id: '76ed4a2f-ea55-4d05-8393-1616dca4c679',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 16280,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'bcaecbbd-bf7c-4f9f-9b4b-c0cbd6240d68',
            },
          },
          {
            id: 'dae9fff7-75f0-479e-83a7-d4465b10bcdc',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 13468,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '3def0285-22e1-401c-916b-56efb977f18e',
            },
          },
          {
            id: 'b22ac8dc-c357-45d9-97d5-9d7f4aeff564',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 13616,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'db86818a-f58b-4df4-8b61-46de85d13a00',
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/081338_1_large.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          {
            name: 'articleNumberManufacturer',
            value: 'WPT492 T225 B044 0880 001',
          },
          { name: 'articleNumberMax', value: '81338' },
          { name: 'matrixId', value: 'M0E20000000EE54' },
          { name: 'baseId', value: '81338' },
          { name: 'designer', value: { key: 'cycle', label: 'Cycle' } },
          { name: 'madeInItaly', value: { key: 'yes', label: 'yes' } },
          { name: 'commonSize', value: { key: 'xxs', label: 'XXS' } },
          { name: 'size', value: '24' },
          {
            name: 'color',
            value: {
              key: 'blue',
              label: { de: 'blau', it: 'blu', en: 'blue' },
            },
          },
          {
            name: 'colorFreeDefinition',
            value: { en: 'dark blue', de: 'dunkelblau' },
          },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'women', label: 'Damen' } },
          { name: 'season', value: 's15' },
        ],
        assets: [],
      },
      price: {
        id: '268bd270-188d-480e-91ce-62f5ce36cd44',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 14800,
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
        id: 'n9ENOU2i',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2023-06-01T16:09:20.981Z',
      lastModifiedAt: '2023-06-01T16:09:30.359Z',
      state: [
        {
          quantity: 2,
          state: {
            typeId: 'state',
            id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 29600,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 24874,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 29600,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 4726,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '69840f60-bd39-4958-b3fc-85bf6c492791' },
        fields: {},
      },
    },
    {
      id: 'ab9ef647-7d34-4068-8dee-3d99ae551db8',
      productId: '253ec97b-f8ac-4a14-94e2-150f5ab0510a',
      productKey: '82378',
      name: {
        en: 'Casual jacket Michael Kors beige',
        de: 'Freizeitjacke Michael Kors beige',
      },
      productType: {
        typeId: 'product-type',
        id: 'f084fa3e-01bd-4ee2-8c8a-9a18764e8841',
        version: 1,
      },
      productSlug: {
        en: 'michael-kors-casualjacket-CS52DHK2J1-beige',
        de: 'michael-kors-freizeitjacke-CS52DHK2J1-beige',
      },
      variant: {
        id: 5,
        sku: 'M0E20000000ELDF',
        key: 'M0E20000000ELDF',
        prices: [
          {
            id: '9d02d6c5-5793-4a51-a88b-b1bd3c4970e9',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 37375,
              fractionDigits: 2,
            },
          },
          {
            id: 'cb422d9d-7527-4e1d-a0b0-ac1ff30266f5',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24508,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: 'a859d05d-7e10-4436-8585-4dcb2f89184f',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 37375,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: '331e4996-09f3-4bb9-8aad-5aa4f01d1a68',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24508,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: 'cebc8f32-160a-4281-9e9c-6225e0916193',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29900,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: '7be70a12-5b99-4a70-953a-f83042e56619',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29900,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: '9494781f-e323-4557-bcbe-cf583636a1d0',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29900,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: '1e9fd61b-7a7e-46ad-9bb9-9d34229864f3',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26910,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'd4e8a815-830f-43bf-8506-77de565bf3f3',
            },
          },
          {
            id: 'ddd4409a-86f8-415d-9347-88212b24019c',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 34011,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '68506b79-8d88-47ab-b77d-5b54cb6eec03',
            },
          },
          {
            id: '4a3da5ee-4f9b-43f0-8e28-0b8ac6df763d',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 27807,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '075f15ed-e66a-49a6-8d61-786145ac1a7a',
            },
          },
          {
            id: 'fa819a8e-1661-427f-a898-d2064a986dc0',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 31694,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'ffecbfe5-a622-4e1f-8704-ac328d94cfb5',
            },
          },
          {
            id: 'f067ab39-6d98-4634-9d93-054dd3b5e076',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 28704,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'c9958b11-6151-433e-83f3-4424e6fa4ac2',
            },
          },
          {
            id: '149eb570-9181-4e71-b860-701caa981009',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 26910,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '2259d32b-2c7a-4941-842a-d81fb3c878e7',
            },
          },
          {
            id: '9355974a-1e96-4f81-8c78-181dc74235d5',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 34011,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '0399ae91-a3be-40ef-90cc-11ac36cf8a62',
            },
          },
          {
            id: 'fe5c6dd3-1ec0-4061-a516-54f28effb72f',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 27807,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'bcaecbbd-bf7c-4f9f-9b4b-c0cbd6240d68',
            },
          },
          {
            id: 'f7948370-f8bf-4b13-b74f-f6a1781e2593',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 31694,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '3def0285-22e1-401c-916b-56efb977f18e',
            },
          },
          {
            id: '90f95175-1c19-4378-9c9e-52113b16862e',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 28704,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'db86818a-f58b-4df4-8b61-46de85d13a00',
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082378_1_medium.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          { name: 'articleNumberManufacturer', value: 'CS52DHK2J1 275' },
          { name: 'articleNumberMax', value: '82378' },
          { name: 'matrixId', value: 'M0E20000000ELDF' },
          { name: 'baseId', value: '82378' },
          {
            name: 'designer',
            value: { key: 'michaelkors', label: 'Michael Kors' },
          },
          { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
          { name: 'commonSize', value: { key: 'l', label: 'L' } },
          { name: 'size', value: 'L' },
          {
            name: 'color',
            value: {
              key: 'beige',
              label: { it: 'beige', de: 'beige', en: 'beige' },
            },
          },
          { name: 'colorFreeDefinition', value: { en: 'beige', de: 'beige' } },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'men', label: 'Herren' } },
          { name: 'season', value: 's15' },
          { name: 'isOnStock', value: true },
        ],
        assets: [],
      },
      price: {
        id: 'cebc8f32-160a-4281-9e9c-6225e0916193',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 29900,
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
        id: 'n9ENOU2i',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2023-06-01T16:09:29.431Z',
      lastModifiedAt: '2023-06-01T16:09:39.975Z',
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 29900,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 25126,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 29900,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 4774,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '69840f60-bd39-4958-b3fc-85bf6c492791' },
        fields: {
          applied_codes: [
            '{"code":"unit1","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":1,"totalDiscountQuantity":1}',
          ],
        },
      },
    },
  ],
  customLineItems: [
    {
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: -29900,
        fractionDigits: 2,
      },
      id: 'ee91bc8b-6b80-4d3c-a942-c05dbdcc39c1',
      name: { en: 'Coupon codes discount', de: 'Gutscheincodes rabatt' },
      money: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: -29900,
        fractionDigits: 2,
      },
      slug: 'Voucher, ',
      quantity: 1,
      discountedPricePerQuantity: [],
      taxCategory: {
        typeId: 'tax-category',
        id: '1f84a16d-00b2-42c3-9367-a7a31bf2ebce',
      },
      taxRate: {
        name: 'coupon',
        amount: 0,
        includedInPrice: true,
        country: 'DE',
        id: '3SF4_HMk',
        subRates: [],
      },
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
          },
        },
      ],
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -29900,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -29900,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
      },
      perMethodTaxRate: [],
      priceMode: 'Standard',
    },
  ],
  transactionFee: true,
  discountCodes: [],
  directDiscounts: [],
  cart: { typeId: 'cart', id: '4aa041de-edd2-4b65-90ca-e55ba26a1336' },
  custom: {
    type: { typeId: 'type', id: '22ec137d-4ea0-468f-98e9-f9289ca8bb01' },
    fields: {
      couponsLimit: 5,
      discount_codes: [
        '{"code":"unit1","status":"APPLIED","type":"voucher","value":29900}',
      ],
      shippingProductSourceIds: ['253ec97b-f8ac-4a14-94e2-150f5ab0510a'],
      session: 'ssn_IU00aC1TMDiVrJSR31FqIohgxElo4uxP',
    },
  },
  billingAddress: {
    firstName: 'Piotr',
    lastName: 'Zieliński',
    streetName: 'Porcelanowa',
    postalCode: '32-000',
    city: 'Kraków',
    country: 'DE',
    phone: '+48796120506',
    email: 'piotrzielinski@gmail.com',
  },
  itemShippingAddresses: [],
  refusedGifts: [],
};

export const getSimpleMetadataForOrderAllMetadataSchemaProperties = [
  'location_id',
  'payment_mean',
  'booking_end_date',
  'booking_start_date',
  'billingAddress',
];

export const translateCtOrderToOrderOrderObject = {
  type: 'Order',
  id: '9537a7d8-d982-4107-b245-a19640656c38',
  version: 2,
  versionModifiedAt: '2023-06-01T16:24:58.356Z',
  lastMessageSequenceNumber: 2,
  createdAt: '2023-06-01T16:24:58.182Z',
  lastModifiedAt: '2023-06-01T16:24:58.182Z',
  lastModifiedBy: {
    isPlatformClient: true,
    user: { typeId: 'user', id: 'eb521f4b-5a8b-4958-ba9c-93dd29d7c363' },
  },
  createdBy: {
    clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
    isPlatformClient: false,
    anonymousId: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
  },
  anonymousId: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 25000,
    fractionDigits: 2,
  },
  taxedPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 16234,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 25000,
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
          centAmount: 8766,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 8766,
      fractionDigits: 2,
    },
  },
  country: 'DE',
  taxedShippingPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
  },
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
  shippingInfo: {
    shippingMethodName: 'Standard EU',
    price: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 0,
      fractionDigits: 2,
    },
    shippingRate: {
      price: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 300,
        fractionDigits: 2,
      },
      freeAbove: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 20000,
        fractionDigits: 2,
      },
      tiers: [],
    },
    taxRate: {
      name: '19% incl.',
      amount: 0.19,
      includedInPrice: true,
      country: 'DE',
      id: 'n9ENOU2i',
      subRates: [],
    },
    taxCategory: {
      typeId: 'tax-category',
      id: '72f8835b-53ae-4d3b-bd3b-a17dafd26c99',
    },
    deliveries: [],
    shippingMethod: {
      typeId: 'shipping-method',
      id: '4e09f55b-f33b-47a1-a236-a9785c8da88d',
    },
    taxedPrice: {
      totalNet: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      totalGross: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      totalTax: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
    },
    shippingMethodState: 'MatchesCart',
  },
  shippingAddress: {
    firstName: 'Piotr',
    lastName: 'Zieliński',
    streetName: 'Porcelanowa',
    postalCode: '32-000',
    city: 'Kraków',
    country: 'DE',
    phone: '+48796120506',
    email: 'piotrzielinski@gmail.com',
  },
  shipping: [],
  lineItems: [
    {
      id: 'ecb98d28-4fb3-4378-94bc-89bd74c2d126',
      productId: 'd5c95d66-13c8-4729-9248-de8b7544d333',
      productKey: '82398',
      name: {
        en: 'Slip-On Shoes “Olivia” Michael Kors black',
        de: 'Slip-On Schuhe „Olivia“ Michael Kors schwarz',
      },
      productType: {
        typeId: 'product-type',
        id: 'f084fa3e-01bd-4ee2-8c8a-9a18764e8841',
        version: 1,
      },
      productSlug: {
        en: 'michael-kors-slip-on-olivia-43S5OLFP1L-black',
        de: 'michael-kors-slip-on-olivia-43S5OLFP1L-schwarz',
      },
      variant: {
        id: 1,
        sku: 'M0E20000000ELIV',
        key: 'M0E20000000ELIV',
        prices: [
          {
            id: '60f68239-2e2f-4c75-bff5-6e5405b11b9a',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 15625,
              fractionDigits: 2,
            },
          },
          {
            id: '993661a3-6e60-46c8-b71d-a2e57fac94da',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 10246,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: '50ecf507-a22f-4ce1-a8cf-c7f88a7a32a3',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 15625,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: 'f3a18448-4816-4b3e-90a8-6deec8479f9d',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 10246,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: 'e2561b96-18dc-45fd-8251-88949627fbde',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 12500,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: '6a7f9ffe-7da3-42ab-a2f4-222397430db1',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 12500,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: 'a5322692-49f3-4601-930f-9b5b5fcc28ea',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 12500,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: '4cb6e207-65da-4db3-a84b-5ca805e18b18',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 12625,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'd4e8a815-830f-43bf-8506-77de565bf3f3',
            },
          },
          {
            id: '8e2df96a-90e3-446c-a673-d881f27f4f9b',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 16250,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '68506b79-8d88-47ab-b77d-5b54cb6eec03',
            },
          },
          {
            id: 'deb05b45-9e7f-4740-83db-8a9e96235724',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 11625,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '075f15ed-e66a-49a6-8d61-786145ac1a7a',
            },
          },
          {
            id: '28958de9-a79e-42c6-9a0c-5cd7ac0d24f6',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 13500,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'ffecbfe5-a622-4e1f-8704-ac328d94cfb5',
            },
          },
          {
            id: '1c307d7a-60e7-4b48-8f21-4e3e5631ef63',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 13375,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'c9958b11-6151-433e-83f3-4424e6fa4ac2',
            },
          },
          {
            id: '05c025de-c950-4916-9d1b-3dd903c2e362',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 12625,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '2259d32b-2c7a-4941-842a-d81fb3c878e7',
            },
          },
          {
            id: '5f22d547-b831-4124-9556-7844b1af4518',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 16250,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '0399ae91-a3be-40ef-90cc-11ac36cf8a62',
            },
          },
          {
            id: '8a3ebd9a-834d-43ef-9f27-78f2142cce98',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 11625,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'bcaecbbd-bf7c-4f9f-9b4b-c0cbd6240d68',
            },
          },
          {
            id: 'b9a901b0-f5d2-424b-b854-b0eafa985ee8',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 13500,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '3def0285-22e1-401c-916b-56efb977f18e',
            },
          },
          {
            id: 'be05566e-689a-416b-886f-7a8b31559d00',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 13375,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'db86818a-f58b-4df4-8b61-46de85d13a00',
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082398_1_large.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          { name: 'articleNumberManufacturer', value: '43S5OLFP1L 001' },
          { name: 'articleNumberMax', value: '82398' },
          { name: 'matrixId', value: 'M0E20000000ELIV' },
          { name: 'baseId', value: '82398' },
          {
            name: 'designer',
            value: { key: 'michaelkors', label: 'Michael Kors' },
          },
          { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
          { name: 'commonSize', value: { key: '35', label: '35' } },
          { name: 'size', value: '5' },
          {
            name: 'color',
            value: {
              key: 'black',
              label: { en: 'black', it: 'nero', de: 'schwarz' },
            },
          },
          {
            name: 'colorFreeDefinition',
            value: { en: 'black', de: 'schwarz' },
          },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'women', label: 'Damen' } },
          { name: 'season', value: 's15' },
        ],
        assets: [],
      },
      price: {
        id: 'e2561b96-18dc-45fd-8251-88949627fbde',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 12500,
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
        id: 'n9ENOU2i',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2023-06-01T16:24:41.000Z',
      lastModifiedAt: '2023-06-01T16:24:47.282Z',
      state: [
        {
          quantity: 2,
          state: {
            typeId: 'state',
            id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 25000,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 21008,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 25000,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 3992,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '69840f60-bd39-4958-b3fc-85bf6c492791' },
        fields: {},
      },
    },
    {
      id: 'c57ecc0f-e007-4ee0-bfbe-5f94fb03f906',
      productId: '253ec97b-f8ac-4a14-94e2-150f5ab0510a',
      productKey: '82378',
      name: {
        en: 'Casual jacket Michael Kors beige',
        de: 'Freizeitjacke Michael Kors beige',
      },
      productType: {
        typeId: 'product-type',
        id: 'f084fa3e-01bd-4ee2-8c8a-9a18764e8841',
        version: 1,
      },
      productSlug: {
        en: 'michael-kors-casualjacket-CS52DHK2J1-beige',
        de: 'michael-kors-freizeitjacke-CS52DHK2J1-beige',
      },
      variant: {
        id: 5,
        sku: 'M0E20000000ELDF',
        key: 'M0E20000000ELDF',
        prices: [
          {
            id: '9d02d6c5-5793-4a51-a88b-b1bd3c4970e9',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 37375,
              fractionDigits: 2,
            },
          },
          {
            id: 'cb422d9d-7527-4e1d-a0b0-ac1ff30266f5',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 24508,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: 'a859d05d-7e10-4436-8585-4dcb2f89184f',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 37375,
              fractionDigits: 2,
            },
            country: 'US',
          },
          {
            id: '331e4996-09f3-4bb9-8aad-5aa4f01d1a68',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 24508,
              fractionDigits: 2,
            },
            customerGroup: {
              typeId: 'customer-group',
              id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
            },
          },
          {
            id: 'cebc8f32-160a-4281-9e9c-6225e0916193',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29900,
              fractionDigits: 2,
            },
            country: 'DE',
          },
          {
            id: '7be70a12-5b99-4a70-953a-f83042e56619',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29900,
              fractionDigits: 2,
            },
            country: 'IT',
          },
          {
            id: '9494781f-e323-4557-bcbe-cf583636a1d0',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 29900,
              fractionDigits: 2,
            },
            country: 'GB',
          },
          {
            id: '1e9fd61b-7a7e-46ad-9bb9-9d34229864f3',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 26910,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'd4e8a815-830f-43bf-8506-77de565bf3f3',
            },
          },
          {
            id: 'ddd4409a-86f8-415d-9347-88212b24019c',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 34011,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '68506b79-8d88-47ab-b77d-5b54cb6eec03',
            },
          },
          {
            id: '4a3da5ee-4f9b-43f0-8e28-0b8ac6df763d',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 27807,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: '075f15ed-e66a-49a6-8d61-786145ac1a7a',
            },
          },
          {
            id: 'fa819a8e-1661-427f-a898-d2064a986dc0',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 31694,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'ffecbfe5-a622-4e1f-8704-ac328d94cfb5',
            },
          },
          {
            id: 'f067ab39-6d98-4634-9d93-054dd3b5e076',
            value: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 28704,
              fractionDigits: 2,
            },
            country: 'DE',
            channel: {
              typeId: 'channel',
              id: 'c9958b11-6151-433e-83f3-4424e6fa4ac2',
            },
          },
          {
            id: '149eb570-9181-4e71-b860-701caa981009',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 26910,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '2259d32b-2c7a-4941-842a-d81fb3c878e7',
            },
          },
          {
            id: '9355974a-1e96-4f81-8c78-181dc74235d5',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 34011,
              fractionDigits: 2,
            },
            channel: {
              typeId: 'channel',
              id: '0399ae91-a3be-40ef-90cc-11ac36cf8a62',
            },
          },
          {
            id: 'fe5c6dd3-1ec0-4061-a516-54f28effb72f',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 27807,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'bcaecbbd-bf7c-4f9f-9b4b-c0cbd6240d68',
            },
          },
          {
            id: 'f7948370-f8bf-4b13-b74f-f6a1781e2593',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 31694,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: '3def0285-22e1-401c-916b-56efb977f18e',
            },
          },
          {
            id: '90f95175-1c19-4378-9c9e-52113b16862e',
            value: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 28704,
              fractionDigits: 2,
            },
            country: 'US',
            channel: {
              typeId: 'channel',
              id: 'db86818a-f58b-4df4-8b61-46de85d13a00',
            },
          },
        ],
        images: [
          {
            url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082378_1_medium.jpg',
            dimensions: { w: 0, h: 0 },
          },
        ],
        attributes: [
          { name: 'articleNumberManufacturer', value: 'CS52DHK2J1 275' },
          { name: 'articleNumberMax', value: '82378' },
          { name: 'matrixId', value: 'M0E20000000ELDF' },
          { name: 'baseId', value: '82378' },
          {
            name: 'designer',
            value: { key: 'michaelkors', label: 'Michael Kors' },
          },
          { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
          { name: 'commonSize', value: { key: 'l', label: 'L' } },
          { name: 'size', value: 'L' },
          {
            name: 'color',
            value: {
              key: 'beige',
              label: { it: 'beige', de: 'beige', en: 'beige' },
            },
          },
          { name: 'colorFreeDefinition', value: { en: 'beige', de: 'beige' } },
          { name: 'style', value: { key: 'sporty', label: 'sporty' } },
          { name: 'gender', value: { key: 'men', label: 'Herren' } },
          { name: 'season', value: 's15' },
          { name: 'isOnStock', value: true },
        ],
        assets: [],
      },
      price: {
        id: 'cebc8f32-160a-4281-9e9c-6225e0916193',
        value: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 29900,
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
        id: 'n9ENOU2i',
        subRates: [],
      },
      perMethodTaxRate: [],
      addedAt: '2023-06-01T16:24:46.154Z',
      lastModifiedAt: '2023-06-01T16:24:58.058Z',
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
          },
        },
      ],
      priceMode: 'Platform',
      lineItemMode: 'Standard',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 29900,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 25126,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 29900,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 4774,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '69840f60-bd39-4958-b3fc-85bf6c492791' },
        fields: {
          applied_codes: [
            '{"code":"unit1","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":1,"totalDiscountQuantity":1}',
          ],
        },
      },
    },
  ],
  customLineItems: [
    {
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: -29900,
        fractionDigits: 2,
      },
      id: 'ab0910cb-43e9-4587-92d3-f963df002cb7',
      name: { en: 'Coupon codes discount', de: 'Gutscheincodes rabatt' },
      money: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: -29900,
        fractionDigits: 2,
      },
      slug: 'Voucher, ',
      quantity: 1,
      discountedPricePerQuantity: [],
      taxCategory: {
        typeId: 'tax-category',
        id: '1f84a16d-00b2-42c3-9367-a7a31bf2ebce',
      },
      taxRate: {
        name: 'coupon',
        amount: 0,
        includedInPrice: true,
        country: 'DE',
        id: '3SF4_HMk',
        subRates: [],
      },
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
          },
        },
      ],
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -29900,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -29900,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
      },
      perMethodTaxRate: [],
      priceMode: 'Standard',
    },
  ],
  transactionFee: true,
  discountCodes: [],
  directDiscounts: [],
  cart: { typeId: 'cart', id: 'fae18a02-ab9c-4468-9e90-d8fb13889444' },
  custom: {
    type: { typeId: 'type', id: '22ec137d-4ea0-468f-98e9-f9289ca8bb01' },
    fields: {
      couponsLimit: 5,
      discount_codes: [
        '{"code":"unit1","status":"APPLIED","type":"voucher","value":29900}',
      ],
      shippingProductSourceIds: ['253ec97b-f8ac-4a14-94e2-150f5ab0510a'],
      session: 'ssn_VbEtLkyW8ZSOaVlN39qUk0StMO5ZZYwJ',
    },
  },
  billingAddress: {
    firstName: 'Piotr',
    lastName: 'Zieliński',
    streetName: 'Porcelanowa',
    postalCode: '32-000',
    city: 'Kraków',
    country: 'DE',
    phone: '+48796120506',
    email: 'piotrzielinski@gmail.com',
  },
  itemShippingAddresses: [],
  refusedGifts: [],
};

export const translateCtOrderToOrderResponse = {
  id: '9537a7d8-d982-4107-b245-a19640656c38',
  customer: {
    source_id: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
    name: 'Piotr Zieliński',
    email: 'piotrzielinski@gmail.com',
    address: {
      city: 'Kraków',
      country: 'DE',
      postal_code: '32-000',
      line_1: 'Porcelanowa',
    },
    phone: '+48796120506',
  },
  customerId: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
  status: 'PAID',
  coupons: [
    { code: 'unit1', status: 'APPLIED', type: 'voucher', value: 29900 },
  ],
  items: [
    {
      source_id: 'M0E20000000ELIV',
      quantity: 2,
      price: 12500,
      amount: 25000,
      name: 'Slip-On Shoes “Olivia” Michael Kors black',
      sku: 'Slip-On Shoes “Olivia” Michael Kors black',
      attributes: [
        { name: 'articleNumberManufacturer', value: '43S5OLFP1L 001' },
        { name: 'articleNumberMax', value: '82398' },
        { name: 'matrixId', value: 'M0E20000000ELIV' },
        { name: 'baseId', value: '82398' },
        {
          name: 'designer',
          value: { key: 'michaelkors', label: 'Michael Kors' },
        },
        { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
        { name: 'commonSize', value: { key: '35', label: '35' } },
        { name: 'size', value: '5' },
        {
          name: 'color',
          value: {
            key: 'black',
            label: { en: 'black', it: 'nero', de: 'schwarz' },
          },
        },
        { name: 'colorFreeDefinition', value: { en: 'black', de: 'schwarz' } },
        { name: 'style', value: { key: 'sporty', label: 'sporty' } },
        { name: 'gender', value: { key: 'women', label: 'Damen' } },
        { name: 'season', value: 's15' },
      ],
    },
    {
      source_id: 'M0E20000000ELDF',
      quantity: 1,
      price: 29900,
      amount: 29900,
      name: 'Casual jacket Michael Kors beige',
      sku: 'Casual jacket Michael Kors beige',
      attributes: [
        { name: 'articleNumberManufacturer', value: 'CS52DHK2J1 275' },
        { name: 'articleNumberMax', value: '82378' },
        { name: 'matrixId', value: 'M0E20000000ELDF' },
        { name: 'baseId', value: '82378' },
        {
          name: 'designer',
          value: { key: 'michaelkors', label: 'Michael Kors' },
        },
        { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
        { name: 'commonSize', value: { key: 'l', label: 'L' } },
        { name: 'size', value: 'L' },
        {
          name: 'color',
          value: {
            key: 'beige',
            label: { it: 'beige', de: 'beige', en: 'beige' },
          },
        },
        { name: 'colorFreeDefinition', value: { en: 'beige', de: 'beige' } },
        { name: 'style', value: { key: 'sporty', label: 'sporty' } },
        { name: 'gender', value: { key: 'men', label: 'Herren' } },
        { name: 'season', value: 's15' },
        { name: 'isOnStock', value: true },
      ],
    },
  ],
  sessionKey: 'ssn_VbEtLkyW8ZSOaVlN39qUk0StMO5ZZYwJ',
  rawOrder: {
    type: 'Order',
    id: '9537a7d8-d982-4107-b245-a19640656c38',
    version: 2,
    versionModifiedAt: '2023-06-01T16:24:58.356Z',
    lastMessageSequenceNumber: 2,
    createdAt: '2023-06-01T16:24:58.182Z',
    lastModifiedAt: '2023-06-01T16:24:58.182Z',
    lastModifiedBy: {
      isPlatformClient: true,
      user: { typeId: 'user', id: 'eb521f4b-5a8b-4958-ba9c-93dd29d7c363' },
    },
    createdBy: {
      clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
      isPlatformClient: false,
      anonymousId: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
    },
    anonymousId: 'ef6b0d17-d57c-438b-a50e-793809f5b843',
    totalPrice: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 25000,
      fractionDigits: 2,
    },
    taxedPrice: {
      totalNet: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 16234,
        fractionDigits: 2,
      },
      totalGross: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 25000,
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
            centAmount: 8766,
            fractionDigits: 2,
          },
          name: '19% incl.',
        },
      ],
      totalTax: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 8766,
        fractionDigits: 2,
      },
    },
    country: 'DE',
    taxedShippingPrice: {
      totalNet: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      totalGross: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      taxPortions: [
        {
          rate: 0.19,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 0,
            fractionDigits: 2,
          },
          name: '19% incl.',
        },
      ],
      totalTax: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
    },
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
    shippingInfo: {
      shippingMethodName: 'Standard EU',
      price: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 0,
        fractionDigits: 2,
      },
      shippingRate: {
        price: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 300,
          fractionDigits: 2,
        },
        freeAbove: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 20000,
          fractionDigits: 2,
        },
        tiers: [],
      },
      taxRate: {
        name: '19% incl.',
        amount: 0.19,
        includedInPrice: true,
        country: 'DE',
        id: 'n9ENOU2i',
        subRates: [],
      },
      taxCategory: {
        typeId: 'tax-category',
        id: '72f8835b-53ae-4d3b-bd3b-a17dafd26c99',
      },
      deliveries: [],
      shippingMethod: {
        typeId: 'shipping-method',
        id: '4e09f55b-f33b-47a1-a236-a9785c8da88d',
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 0,
          fractionDigits: 2,
        },
      },
      shippingMethodState: 'MatchesCart',
    },
    shippingAddress: {
      firstName: 'Piotr',
      lastName: 'Zieliński',
      streetName: 'Porcelanowa',
      postalCode: '32-000',
      city: 'Kraków',
      country: 'DE',
      phone: '+48796120506',
      email: 'piotrzielinski@gmail.com',
    },
    shipping: [],
    lineItems: [
      {
        id: 'ecb98d28-4fb3-4378-94bc-89bd74c2d126',
        productId: 'd5c95d66-13c8-4729-9248-de8b7544d333',
        productKey: '82398',
        name: {
          en: 'Slip-On Shoes “Olivia” Michael Kors black',
          de: 'Slip-On Schuhe „Olivia“ Michael Kors schwarz',
        },
        productType: {
          typeId: 'product-type',
          id: 'f084fa3e-01bd-4ee2-8c8a-9a18764e8841',
          version: 1,
        },
        productSlug: {
          en: 'michael-kors-slip-on-olivia-43S5OLFP1L-black',
          de: 'michael-kors-slip-on-olivia-43S5OLFP1L-schwarz',
        },
        variant: {
          id: 1,
          sku: 'M0E20000000ELIV',
          key: 'M0E20000000ELIV',
          prices: [
            {
              id: '60f68239-2e2f-4c75-bff5-6e5405b11b9a',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 15625,
                fractionDigits: 2,
              },
            },
            {
              id: '993661a3-6e60-46c8-b71d-a2e57fac94da',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 10246,
                fractionDigits: 2,
              },
              customerGroup: {
                typeId: 'customer-group',
                id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
              },
            },
            {
              id: '50ecf507-a22f-4ce1-a8cf-c7f88a7a32a3',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 15625,
                fractionDigits: 2,
              },
              country: 'US',
            },
            {
              id: 'f3a18448-4816-4b3e-90a8-6deec8479f9d',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 10246,
                fractionDigits: 2,
              },
              customerGroup: {
                typeId: 'customer-group',
                id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
              },
            },
            {
              id: 'e2561b96-18dc-45fd-8251-88949627fbde',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 12500,
                fractionDigits: 2,
              },
              country: 'DE',
            },
            {
              id: '6a7f9ffe-7da3-42ab-a2f4-222397430db1',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 12500,
                fractionDigits: 2,
              },
              country: 'IT',
            },
            {
              id: 'a5322692-49f3-4601-930f-9b5b5fcc28ea',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 12500,
                fractionDigits: 2,
              },
              country: 'GB',
            },
            {
              id: '4cb6e207-65da-4db3-a84b-5ca805e18b18',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 12625,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: 'd4e8a815-830f-43bf-8506-77de565bf3f3',
              },
            },
            {
              id: '8e2df96a-90e3-446c-a673-d881f27f4f9b',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 16250,
                fractionDigits: 2,
              },
              channel: {
                typeId: 'channel',
                id: '68506b79-8d88-47ab-b77d-5b54cb6eec03',
              },
            },
            {
              id: 'deb05b45-9e7f-4740-83db-8a9e96235724',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 11625,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: '075f15ed-e66a-49a6-8d61-786145ac1a7a',
              },
            },
            {
              id: '28958de9-a79e-42c6-9a0c-5cd7ac0d24f6',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 13500,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: 'ffecbfe5-a622-4e1f-8704-ac328d94cfb5',
              },
            },
            {
              id: '1c307d7a-60e7-4b48-8f21-4e3e5631ef63',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 13375,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: 'c9958b11-6151-433e-83f3-4424e6fa4ac2',
              },
            },
            {
              id: '05c025de-c950-4916-9d1b-3dd903c2e362',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 12625,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: '2259d32b-2c7a-4941-842a-d81fb3c878e7',
              },
            },
            {
              id: '5f22d547-b831-4124-9556-7844b1af4518',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 16250,
                fractionDigits: 2,
              },
              channel: {
                typeId: 'channel',
                id: '0399ae91-a3be-40ef-90cc-11ac36cf8a62',
              },
            },
            {
              id: '8a3ebd9a-834d-43ef-9f27-78f2142cce98',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 11625,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: 'bcaecbbd-bf7c-4f9f-9b4b-c0cbd6240d68',
              },
            },
            {
              id: 'b9a901b0-f5d2-424b-b854-b0eafa985ee8',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 13500,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: '3def0285-22e1-401c-916b-56efb977f18e',
              },
            },
            {
              id: 'be05566e-689a-416b-886f-7a8b31559d00',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 13375,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: 'db86818a-f58b-4df4-8b61-46de85d13a00',
              },
            },
          ],
          images: [
            {
              url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082398_1_large.jpg',
              dimensions: { w: 0, h: 0 },
            },
          ],
          attributes: [
            { name: 'articleNumberManufacturer', value: '43S5OLFP1L 001' },
            { name: 'articleNumberMax', value: '82398' },
            { name: 'matrixId', value: 'M0E20000000ELIV' },
            { name: 'baseId', value: '82398' },
            {
              name: 'designer',
              value: { key: 'michaelkors', label: 'Michael Kors' },
            },
            { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
            { name: 'commonSize', value: { key: '35', label: '35' } },
            { name: 'size', value: '5' },
            {
              name: 'color',
              value: {
                key: 'black',
                label: { en: 'black', it: 'nero', de: 'schwarz' },
              },
            },
            {
              name: 'colorFreeDefinition',
              value: { en: 'black', de: 'schwarz' },
            },
            { name: 'style', value: { key: 'sporty', label: 'sporty' } },
            { name: 'gender', value: { key: 'women', label: 'Damen' } },
            { name: 'season', value: 's15' },
          ],
          assets: [],
        },
        price: {
          id: 'e2561b96-18dc-45fd-8251-88949627fbde',
          value: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 12500,
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
          id: 'n9ENOU2i',
          subRates: [],
        },
        perMethodTaxRate: [],
        addedAt: '2023-06-01T16:24:41.000Z',
        lastModifiedAt: '2023-06-01T16:24:47.282Z',
        state: [
          {
            quantity: 2,
            state: {
              typeId: 'state',
              id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
            },
          },
        ],
        priceMode: 'Platform',
        lineItemMode: 'Standard',
        totalPrice: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 25000,
          fractionDigits: 2,
        },
        taxedPrice: {
          totalNet: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 21008,
            fractionDigits: 2,
          },
          totalGross: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 25000,
            fractionDigits: 2,
          },
          totalTax: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 3992,
            fractionDigits: 2,
          },
        },
        taxedPricePortions: [],
        custom: {
          type: { typeId: 'type', id: '69840f60-bd39-4958-b3fc-85bf6c492791' },
          fields: {},
        },
      },
      {
        id: 'c57ecc0f-e007-4ee0-bfbe-5f94fb03f906',
        productId: '253ec97b-f8ac-4a14-94e2-150f5ab0510a',
        productKey: '82378',
        name: {
          en: 'Casual jacket Michael Kors beige',
          de: 'Freizeitjacke Michael Kors beige',
        },
        productType: {
          typeId: 'product-type',
          id: 'f084fa3e-01bd-4ee2-8c8a-9a18764e8841',
          version: 1,
        },
        productSlug: {
          en: 'michael-kors-casualjacket-CS52DHK2J1-beige',
          de: 'michael-kors-freizeitjacke-CS52DHK2J1-beige',
        },
        variant: {
          id: 5,
          sku: 'M0E20000000ELDF',
          key: 'M0E20000000ELDF',
          prices: [
            {
              id: '9d02d6c5-5793-4a51-a88b-b1bd3c4970e9',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 37375,
                fractionDigits: 2,
              },
            },
            {
              id: 'cb422d9d-7527-4e1d-a0b0-ac1ff30266f5',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 24508,
                fractionDigits: 2,
              },
              customerGroup: {
                typeId: 'customer-group',
                id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
              },
            },
            {
              id: 'a859d05d-7e10-4436-8585-4dcb2f89184f',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 37375,
                fractionDigits: 2,
              },
              country: 'US',
            },
            {
              id: '331e4996-09f3-4bb9-8aad-5aa4f01d1a68',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 24508,
                fractionDigits: 2,
              },
              customerGroup: {
                typeId: 'customer-group',
                id: '0c826f37-d10d-439c-bf46-ce9e17deab74',
              },
            },
            {
              id: 'cebc8f32-160a-4281-9e9c-6225e0916193',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 29900,
                fractionDigits: 2,
              },
              country: 'DE',
            },
            {
              id: '7be70a12-5b99-4a70-953a-f83042e56619',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 29900,
                fractionDigits: 2,
              },
              country: 'IT',
            },
            {
              id: '9494781f-e323-4557-bcbe-cf583636a1d0',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 29900,
                fractionDigits: 2,
              },
              country: 'GB',
            },
            {
              id: '1e9fd61b-7a7e-46ad-9bb9-9d34229864f3',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 26910,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: 'd4e8a815-830f-43bf-8506-77de565bf3f3',
              },
            },
            {
              id: 'ddd4409a-86f8-415d-9347-88212b24019c',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 34011,
                fractionDigits: 2,
              },
              channel: {
                typeId: 'channel',
                id: '68506b79-8d88-47ab-b77d-5b54cb6eec03',
              },
            },
            {
              id: '4a3da5ee-4f9b-43f0-8e28-0b8ac6df763d',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 27807,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: '075f15ed-e66a-49a6-8d61-786145ac1a7a',
              },
            },
            {
              id: 'fa819a8e-1661-427f-a898-d2064a986dc0',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 31694,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: 'ffecbfe5-a622-4e1f-8704-ac328d94cfb5',
              },
            },
            {
              id: 'f067ab39-6d98-4634-9d93-054dd3b5e076',
              value: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 28704,
                fractionDigits: 2,
              },
              country: 'DE',
              channel: {
                typeId: 'channel',
                id: 'c9958b11-6151-433e-83f3-4424e6fa4ac2',
              },
            },
            {
              id: '149eb570-9181-4e71-b860-701caa981009',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 26910,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: '2259d32b-2c7a-4941-842a-d81fb3c878e7',
              },
            },
            {
              id: '9355974a-1e96-4f81-8c78-181dc74235d5',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 34011,
                fractionDigits: 2,
              },
              channel: {
                typeId: 'channel',
                id: '0399ae91-a3be-40ef-90cc-11ac36cf8a62',
              },
            },
            {
              id: 'fe5c6dd3-1ec0-4061-a516-54f28effb72f',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 27807,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: 'bcaecbbd-bf7c-4f9f-9b4b-c0cbd6240d68',
              },
            },
            {
              id: 'f7948370-f8bf-4b13-b74f-f6a1781e2593',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 31694,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: '3def0285-22e1-401c-916b-56efb977f18e',
              },
            },
            {
              id: '90f95175-1c19-4378-9c9e-52113b16862e',
              value: {
                type: 'centPrecision',
                currencyCode: 'USD',
                centAmount: 28704,
                fractionDigits: 2,
              },
              country: 'US',
              channel: {
                typeId: 'channel',
                id: 'db86818a-f58b-4df4-8b61-46de85d13a00',
              },
            },
          ],
          images: [
            {
              url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082378_1_medium.jpg',
              dimensions: { w: 0, h: 0 },
            },
          ],
          attributes: [
            { name: 'articleNumberManufacturer', value: 'CS52DHK2J1 275' },
            { name: 'articleNumberMax', value: '82378' },
            { name: 'matrixId', value: 'M0E20000000ELDF' },
            { name: 'baseId', value: '82378' },
            {
              name: 'designer',
              value: { key: 'michaelkors', label: 'Michael Kors' },
            },
            { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
            { name: 'commonSize', value: { key: 'l', label: 'L' } },
            { name: 'size', value: 'L' },
            {
              name: 'color',
              value: {
                key: 'beige',
                label: { it: 'beige', de: 'beige', en: 'beige' },
              },
            },
            {
              name: 'colorFreeDefinition',
              value: { en: 'beige', de: 'beige' },
            },
            { name: 'style', value: { key: 'sporty', label: 'sporty' } },
            { name: 'gender', value: { key: 'men', label: 'Herren' } },
            { name: 'season', value: 's15' },
            { name: 'isOnStock', value: true },
          ],
          assets: [],
        },
        price: {
          id: 'cebc8f32-160a-4281-9e9c-6225e0916193',
          value: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 29900,
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
          id: 'n9ENOU2i',
          subRates: [],
        },
        perMethodTaxRate: [],
        addedAt: '2023-06-01T16:24:46.154Z',
        lastModifiedAt: '2023-06-01T16:24:58.058Z',
        state: [
          {
            quantity: 1,
            state: {
              typeId: 'state',
              id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
            },
          },
        ],
        priceMode: 'Platform',
        lineItemMode: 'Standard',
        totalPrice: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 29900,
          fractionDigits: 2,
        },
        taxedPrice: {
          totalNet: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 25126,
            fractionDigits: 2,
          },
          totalGross: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 29900,
            fractionDigits: 2,
          },
          totalTax: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 4774,
            fractionDigits: 2,
          },
        },
        taxedPricePortions: [],
        custom: {
          type: { typeId: 'type', id: '69840f60-bd39-4958-b3fc-85bf6c492791' },
          fields: {
            applied_codes: [
              '{"code":"unit1","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":1,"totalDiscountQuantity":1}',
            ],
          },
        },
      },
    ],
    customLineItems: [
      {
        totalPrice: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -29900,
          fractionDigits: 2,
        },
        id: 'ab0910cb-43e9-4587-92d3-f963df002cb7',
        name: { en: 'Coupon codes discount', de: 'Gutscheincodes rabatt' },
        money: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: -29900,
          fractionDigits: 2,
        },
        slug: 'Voucher, ',
        quantity: 1,
        discountedPricePerQuantity: [],
        taxCategory: {
          typeId: 'tax-category',
          id: '1f84a16d-00b2-42c3-9367-a7a31bf2ebce',
        },
        taxRate: {
          name: 'coupon',
          amount: 0,
          includedInPrice: true,
          country: 'DE',
          id: '3SF4_HMk',
          subRates: [],
        },
        state: [
          {
            quantity: 1,
            state: {
              typeId: 'state',
              id: 'ad3930da-ae5c-4c7e-8ae0-2dfb99d52f50',
            },
          },
        ],
        taxedPrice: {
          totalNet: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: -29900,
            fractionDigits: 2,
          },
          totalGross: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: -29900,
            fractionDigits: 2,
          },
          totalTax: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 0,
            fractionDigits: 2,
          },
        },
        perMethodTaxRate: [],
        priceMode: 'Standard',
      },
    ],
    transactionFee: true,
    discountCodes: [],
    directDiscounts: [],
    cart: { typeId: 'cart', id: 'fae18a02-ab9c-4468-9e90-d8fb13889444' },
    custom: {
      type: { typeId: 'type', id: '22ec137d-4ea0-468f-98e9-f9289ca8bb01' },
      fields: {
        couponsLimit: 5,
        discount_codes: [
          '{"code":"unit1","status":"APPLIED","type":"voucher","value":29900}',
        ],
        shippingProductSourceIds: ['253ec97b-f8ac-4a14-94e2-150f5ab0510a'],
        session: 'ssn_VbEtLkyW8ZSOaVlN39qUk0StMO5ZZYwJ',
      },
    },
    billingAddress: {
      firstName: 'Piotr',
      lastName: 'Zieliński',
      streetName: 'Porcelanowa',
      postalCode: '32-000',
      city: 'Kraków',
      country: 'DE',
      phone: '+48796120506',
      email: 'piotrzielinski@gmail.com',
    },
    itemShippingAddresses: [],
    refusedGifts: [],
  },
};
