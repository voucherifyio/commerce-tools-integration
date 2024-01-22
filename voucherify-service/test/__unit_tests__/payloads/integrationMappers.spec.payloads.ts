export const getOrderObjectOrder = {
  type: 'Order',
  id: '3d64a514-1fb3-4345-b817-f683628f17e5',
  version: 2,
  versionModifiedAt: '2023-06-01T15:06:06.118Z',
  lastMessageSequenceNumber: 2,
  createdAt: '2023-06-01T15:05:43.240Z',
  lastModifiedAt: '2023-06-01T15:06:06.118Z',
  lastModifiedBy: {
    isPlatformClient: true,
    user: { typeId: 'user', id: 'eb521f4b-5a8b-4958-ba9c-93dd29d7c363' },
  },
  createdBy: {
    clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
    isPlatformClient: false,
    anonymousId: '03970ec0-fa17-45d6-a19f-208ee3fcb1a4',
  },
  anonymousId: '03970ec0-fa17-45d6-a19f-208ee3fcb1a4',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 12800,
    fractionDigits: 2,
  },
  taxedPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 10756,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 12800,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 2044,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 2044,
      fractionDigits: 2,
    },
  },
  country: 'DE',
  taxedShippingPrice: {
    totalNet: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 252,
      fractionDigits: 2,
    },
    totalGross: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 300,
      fractionDigits: 2,
    },
    taxPortions: [
      {
        rate: 0.19,
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 48,
          fractionDigits: 2,
        },
        name: '19% incl.',
      },
    ],
    totalTax: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 48,
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
      centAmount: 300,
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
        centAmount: 252,
        fractionDigits: 2,
      },
      totalGross: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 300,
        fractionDigits: 2,
      },
      totalTax: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 48,
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
      id: '6507367a-3e93-473f-a8f1-f1ae6b31095b',
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
      addedAt: '2023-06-01T15:05:33.874Z',
      lastModifiedAt: '2023-06-01T15:05:33.874Z',
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
        centAmount: 12500,
        fractionDigits: 2,
      },
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 10504,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 12500,
          fractionDigits: 2,
        },
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1996,
          fractionDigits: 2,
        },
      },
      taxedPricePortions: [],
      custom: {
        type: { typeId: 'type', id: '69840f60-bd39-4958-b3fc-85bf6c492791' },
        fields: {},
      },
    },
  ],
  customLineItems: [],
  transactionFee: true,
  discountCodes: [],
  directDiscounts: [],
  cart: { typeId: 'cart', id: 'a221f9e2-091b-43d4-9ab9-2777e270e0a0' },
  custom: {
    type: { typeId: 'type', id: '22ec137d-4ea0-468f-98e9-f9289ca8bb01' },
    fields: {
      couponsLimit: 5,
      discount_codes: [
        '{"status":"AVAILABLE","value":1250,"banner":"10% off","code":"promo_sBe05RSTPSfUiojdpwueAkTJ","type":"promotion_tier"}',
        '{"status":"AVAILABLE","value":0,"banner":"Get 5% for your first order","code":"promo_1c4Q5taDrKynBgA4aTJGyp0p","type":"promotion_tier"}',
      ],
      shippingProductSourceIds: [],
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

export const getOrderObjectResponse = {
  object: 'order',
  source_id: '3d64a514-1fb3-4345-b817-f683628f17e5',
  created_at: '2023-06-01T15:05:43.240Z',
  updated_at: '2023-06-01T15:06:06.118Z',
  status: 'PAID',
  customer: {
    object: 'customer',
    source_id: '03970ec0-fa17-45d6-a19f-208ee3fcb1a4',
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
  items: [
    {
      source_id: 'M0E20000000ELIV',
      related_object: 'sku',
      quantity: 1,
      price: 12500,
      amount: 12500,
      product: { name: 'Slip-On Shoes “Olivia” Michael Kors black' },
      sku: { sku: 'Slip-On Shoes “Olivia” Michael Kors black' },
    },
  ],
};

export const buildRedeemStackableRequestForVoucherifyOrder = {
  id: '2a3c3757-5314-4565-807a-a77509937834',
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
  sessionKey: 'ssn_M8XW3MQwcHa2vRInmEP0lTsFYoN5MIGl',
  rawOrder: {
    type: 'Order',
    id: '2a3c3757-5314-4565-807a-a77509937834',
    version: 2,
    versionModifiedAt: '2023-06-01T15:46:37.409Z',
    lastMessageSequenceNumber: 2,
    createdAt: '2023-06-01T15:46:37.231Z',
    lastModifiedAt: '2023-06-01T15:46:37.231Z',
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
        id: '1ea39080-2b19-45c8-8505-6320015674b0',
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
        addedAt: '2023-06-01T15:46:24.051Z',
        lastModifiedAt: '2023-06-01T15:46:30.857Z',
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
        id: 'd3d54486-6efb-429f-a2c8-536b53589bef',
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
        addedAt: '2023-06-01T15:46:29.601Z',
        lastModifiedAt: '2023-06-01T15:46:37.103Z',
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
        id: 'c79a0c01-0be0-4d3d-aab3-89cfd27ebc6e',
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
    cart: { typeId: 'cart', id: 'e3f860cd-c5ac-4167-9d4f-a8f612ae0cfd' },
    custom: {
      type: { typeId: 'type', id: '22ec137d-4ea0-468f-98e9-f9289ca8bb01' },
      fields: {
        couponsLimit: 5,
        discount_codes: [
          '{"code":"unit1","status":"APPLIED","type":"voucher","value":29900}',
        ],
        shippingProductSourceIds: ['253ec97b-f8ac-4a14-94e2-150f5ab0510a'],
        session: 'ssn_M8XW3MQwcHa2vRInmEP0lTsFYoN5MIGl',
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

export const buildRedeemStackableRequestForVoucherifyItems = [
  {
    source_id: 'M0E20000000ELIV',
    related_object: 'sku',
    quantity: 2,
    price: 12500,
    amount: 25000,
    product: {
      override: true,
      name: 'Slip-On Shoes “Olivia” Michael Kors black',
    },
    sku: {
      override: true,
      sku: 'Slip-On Shoes “Olivia” Michael Kors black',
      metadata: {},
    },
  },
  {
    source_id: 'M0E20000000ELDF',
    related_object: 'sku',
    quantity: 1,
    price: 29900,
    amount: 29900,
    product: { override: true, name: 'Casual jacket Michael Kors beige' },
    sku: {
      override: true,
      sku: 'Casual jacket Michael Kors beige',
      metadata: {},
    },
  },
];

export const buildRedeemStackableRequestForVoucherifyResponse = {
  session: { type: 'LOCK', key: 'ssn_M8XW3MQwcHa2vRInmEP0lTsFYoN5MIGl' },
  redeemables: [{ object: 'voucher', id: 'unit1' }],
  order: {
    source_id: '2a3c3757-5314-4565-807a-a77509937834',
    amount: 54900,
    status: 'PAID',
    items: [
      {
        source_id: 'M0E20000000ELIV',
        related_object: 'sku',
        quantity: 2,
        price: 12500,
        amount: 25000,
        product: {
          override: true,
          name: 'Slip-On Shoes “Olivia” Michael Kors black',
        },
        sku: {
          override: true,
          sku: 'Slip-On Shoes “Olivia” Michael Kors black',
          metadata: {},
        },
      },
      {
        source_id: 'M0E20000000ELDF',
        related_object: 'sku',
        quantity: 1,
        price: 29900,
        amount: 29900,
        product: { override: true, name: 'Casual jacket Michael Kors beige' },
        sku: {
          override: true,
          sku: 'Casual jacket Michael Kors beige',
          metadata: {},
        },
      },
    ],
    metadata: {},
  },
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
};
