import { CommercetoolsConnectorService } from '../../src/commercetools/commercetools-connector.service';
import { ConfigService } from '@nestjs/config';

export const getCommerceToolsConnectorServiceMockWithEmptyProductResponse =
  () => {
    const commerceToolsConnectoService = jest.createMockFromModule(
      '../../src/commercetools/commercetools-connector.service',
    ) as CommercetoolsConnectorService & { getProductMock: jest.Mock };
    const products: any = {
      body: {
        results: [],
      },
    };

    commerceToolsConnectoService.getProductMock = jest
      .fn()
      .mockReturnValue(products);

    commerceToolsConnectoService.getClient = jest.fn().mockReturnValue({
      products: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue({
          execute: commerceToolsConnectoService.getProductMock,
        }),
      }),
    });

    return commerceToolsConnectoService;
  };

type Product = {
  sku: string;
  price: number;
  id: string;
};
export const getCommerceToolsConnectorServiceMockWithProductResponse = (
  product: Product,
) => {
  const commerceToolsConnectorService = jest.createMockFromModule(
    '../../src/commercetools/commercetools-connector.service',
  ) as CommercetoolsConnectorService;

  const products: any = {
    body: {
      results: [
        {
          id: product.id,
          masterData: {
            current: {
              variants: [
                {
                  sku: product.sku,
                  prices: [
                    {
                      value: {
                        centAmount: product.price,
                        currencyCode: 'EUR',
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  };

  const getTaxCategories = jest.fn().mockReturnValue({
    catch: jest.fn().mockReturnValue({
      statusCode: 200,
      body: {
        limit: 20,
        offset: 0,
        count: 1,
        total: 1,
        results: [
          {
            id: '1f84a16d-00b2-42c3-9367-a7a31bf2ebce',
            version: 5,
            versionModifiedAt: '2023-05-31T16:04:06.867Z',
            createdAt: '2023-05-31T16:04:06.656Z',
            lastModifiedAt: '2023-05-31T16:04:06.867Z',
            lastModifiedBy: {
              clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
              isPlatformClient: false,
            },
            createdBy: {
              clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
              isPlatformClient: false,
            },
            name: 'coupon',
            rates: [
              {
                name: 'coupon',
                amount: 0,
                includedInPrice: true,
                country: 'DE',
                id: '3SF4_HMk',
                subRates: [],
              },
              {
                name: 'coupon',
                amount: 0,
                includedInPrice: true,
                country: 'AT',
                id: 'lRz7jEYP',
                subRates: [],
              },
              {
                name: 'coupon',
                amount: 0,
                includedInPrice: true,
                country: 'US',
                id: 'Uw-uqD9r',
                subRates: [],
              },
              {
                name: 'coupon',
                amount: 0,
                includedInPrice: true,
                country: 'NL',
                id: 'StiKGNhA',
                subRates: [],
              },
            ],
          },
        ],
      },
    }),
  });
  const getClientResponse = {
    body: {
      key: 'ct-voucherify-piotr',
      name: 'ct-voucherify-piotr',
      countries: ['DE', 'AT', 'US', 'NL'],
      currencies: ['EUR', 'USD'],
      languages: ['en', 'de'],
      createdAt: '2023-05-31T15:50:11.972Z',
      createdBy: {
        isPlatformClient: true,
        user: { typeId: 'user', id: 'eb521f4b-5a8b-4958-ba9c-93dd29d7c363' },
      },
      lastModifiedAt: '2023-06-01T13:49:43.819Z',
      lastModifiedBy: { isPlatformClient: true },
      trialUntil: '2023-07',
      messages: { enabled: false, deleteDaysAfterCreation: 15 },
      carts: {
        deleteDaysAfterLastModification: 90,
        allowAddingUnpublishedProducts: false,
        countryTaxRateFallbackEnabled: false,
      },
      shoppingLists: { deleteDaysAfterLastModification: 360 },
      version: 9,
      searchIndexing: {
        products: {
          status: 'Activated',
          lastModifiedAt: '2023-05-31T16:05:30.570Z',
          lastModifiedBy: { isPlatformClient: true },
        },
        orders: {
          status: 'Activated',
          lastModifiedAt: '2023-06-01T13:49:43.817Z',
          lastModifiedBy: { isPlatformClient: true },
        },
      },
    },
    statusCode: 200,
  };
  const get = jest.fn().mockReturnValue({ execute: getTaxCategories });
  const taxCategories = jest.fn().mockReturnValue({ get });
  commerceToolsConnectorService.getClient = jest.fn().mockReturnValue({
    products: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        execute: () => ({
          catch: jest.fn().mockReturnValue(products),
        }),
      }),
    }),
    taxCategories,
    get: jest.fn().mockReturnValue({
      execute: () => ({
        catch: jest.fn().mockReturnValue(getClientResponse),
      }),
    }),
  });

  return commerceToolsConnectorService;
};

export const getCommerceToolsConnectorServiceMockWithCouponTypes = () => {
  const commerceToolsConnectoService = jest.createMockFromModule(
    '../../src/commercetools/commercetools-connector.service',
  ) as CommercetoolsConnectorService;

  const get = (payload) => {
    if (payload?.queryArgs?.where === 'key="couponCodes"') {
      return {
        execute: () => ({
          catch: jest.fn().mockReturnValue({
            body: {
              limit: 20,
              offset: 0,
              count: 1,
              total: 1,
              results: [
                {
                  id: '22ec137d-4ea0-468f-98e9-f9289ca8bb01',
                  version: 1,
                  versionModifiedAt: '2023-05-31T16:04:06.194Z',
                  createdAt: '2023-05-31T16:04:06.194Z',
                  lastModifiedAt: '2023-05-31T16:04:06.194Z',
                  lastModifiedBy: {
                    clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                    isPlatformClient: false,
                  },
                  createdBy: {
                    clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                    isPlatformClient: false,
                  },
                  key: 'couponCodes',
                  name: { en: 'couponCodes' },
                  description: { en: 'couponCodes' },
                  resourceTypeIds: ['order'],
                  fieldDefinitions: [
                    {
                      name: 'discount_codes',
                      label: { en: 'discount_codes' },
                      required: false,
                      type: { name: 'Set', elementType: { name: 'String' } },
                      inputHint: 'SingleLine',
                    },
                    {
                      name: 'used_codes',
                      label: { en: 'used_codes' },
                      required: false,
                      type: { name: 'Set', elementType: { name: 'String' } },
                      inputHint: 'SingleLine',
                    },
                    {
                      name: 'session',
                      label: { en: 'session' },
                      required: false,
                      type: { name: 'String' },
                      inputHint: 'SingleLine',
                    },
                    {
                      name: 'shippingProductSourceIds',
                      label: { en: 'shippingProductSourceIds' },
                      required: false,
                      type: { name: 'Set', elementType: { name: 'String' } },
                      inputHint: 'SingleLine',
                    },
                    {
                      name: 'couponsLimit',
                      label: { en: 'couponsLimit' },
                      required: false,
                      type: { name: 'Number' },
                      inputHint: 'SingleLine',
                    },
                  ],
                },
              ],
            },
            statusCode: 200,
          }),
        }),
      };
    }
    return {
      execute: () => ({
        catch: jest.fn().mockReturnValue({
          body: {
            limit: 20,
            offset: 0,
            count: 1,
            total: 1,
            results: [
              {
                id: '69840f60-bd39-4958-b3fc-85bf6c492791',
                version: 1,
                versionModifiedAt: '2023-05-31T16:04:06.433Z',
                createdAt: '2023-05-31T16:04:06.433Z',
                lastModifiedAt: '2023-05-31T16:04:06.433Z',
                lastModifiedBy: {
                  clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                  isPlatformClient: false,
                },
                createdBy: {
                  clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                  isPlatformClient: false,
                },
                key: 'lineItemCodesType',
                name: { en: 'lineItemCodesType' },
                description: { en: 'lineItemCodesType' },
                resourceTypeIds: ['line-item'],
                fieldDefinitions: [
                  {
                    name: 'applied_codes',
                    label: { en: 'applied_codes' },
                    required: false,
                    type: { name: 'Set', elementType: { name: 'String' } },
                    inputHint: 'SingleLine',
                  },
                  {
                    name: 'coupon_fixed_price',
                    label: { en: 'coupon_fixed_price' },
                    required: false,
                    type: { name: 'Number' },
                    inputHint: 'SingleLine',
                  },
                ],
              },
            ],
          },
          statusCode: 200,
        }),
      }),
    };
  };

  commerceToolsConnectoService.getClient = jest.fn().mockReturnValue({
    types: jest.fn().mockReturnValue({
      get,
    }),
  });

  return commerceToolsConnectoService;
};

export const getCommerceToolsConnectorServiceMockForAPIExtensionServiceTest =
  () => {
    const commerceToolsConnectoService = jest.createMockFromModule(
      '../../src/commercetools/commercetools-connector.service',
    ) as CommercetoolsConnectorService;

    const get = (payload) => {
      if (payload?.queryArgs?.where === 'key="couponCodes"') {
        return {
          execute: () => ({
            catch: jest.fn().mockReturnValue({
              body: {
                limit: 20,
                offset: 0,
                count: 1,
                total: 1,
                results: [
                  {
                    id: '22ec137d-4ea0-468f-98e9-f9289ca8bb01',
                    version: 1,
                    versionModifiedAt: '2023-05-31T16:04:06.194Z',
                    createdAt: '2023-05-31T16:04:06.194Z',
                    lastModifiedAt: '2023-05-31T16:04:06.194Z',
                    lastModifiedBy: {
                      clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                      isPlatformClient: false,
                    },
                    createdBy: {
                      clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                      isPlatformClient: false,
                    },
                    key: 'couponCodes',
                    name: { en: 'couponCodes' },
                    description: { en: 'couponCodes' },
                    resourceTypeIds: ['order'],
                    fieldDefinitions: [
                      {
                        name: 'discount_codes',
                        label: { en: 'discount_codes' },
                        required: false,
                        type: { name: 'Set', elementType: { name: 'String' } },
                        inputHint: 'SingleLine',
                      },
                      {
                        name: 'used_codes',
                        label: { en: 'used_codes' },
                        required: false,
                        type: { name: 'Set', elementType: { name: 'String' } },
                        inputHint: 'SingleLine',
                      },
                      {
                        name: 'session',
                        label: { en: 'session' },
                        required: false,
                        type: { name: 'String' },
                        inputHint: 'SingleLine',
                      },
                      {
                        name: 'shippingProductSourceIds',
                        label: { en: 'shippingProductSourceIds' },
                        required: false,
                        type: { name: 'Set', elementType: { name: 'String' } },
                        inputHint: 'SingleLine',
                      },
                      {
                        name: 'couponsLimit',
                        label: { en: 'couponsLimit' },
                        required: false,
                        type: { name: 'Number' },
                        inputHint: 'SingleLine',
                      },
                    ],
                  },
                ],
              },
              statusCode: 200,
            }),
          }),
        };
      }
      return {
        execute: () => ({
          catch: jest.fn().mockReturnValue({
            body: {
              limit: 20,
              offset: 0,
              count: 1,
              total: 1,
              results: [
                {
                  id: '69840f60-bd39-4958-b3fc-85bf6c492791',
                  version: 1,
                  versionModifiedAt: '2023-05-31T16:04:06.433Z',
                  createdAt: '2023-05-31T16:04:06.433Z',
                  lastModifiedAt: '2023-05-31T16:04:06.433Z',
                  lastModifiedBy: {
                    clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                    isPlatformClient: false,
                  },
                  createdBy: {
                    clientId: '3cx8PEBHMZQ1oHAYF1eoDs8i',
                    isPlatformClient: false,
                  },
                  key: 'lineItemCodesType',
                  name: { en: 'lineItemCodesType' },
                  description: { en: 'lineItemCodesType' },
                  resourceTypeIds: ['line-item'],
                  fieldDefinitions: [
                    {
                      name: 'applied_codes',
                      label: { en: 'applied_codes' },
                      required: false,
                      type: { name: 'Set', elementType: { name: 'String' } },
                      inputHint: 'SingleLine',
                    },
                    {
                      name: 'coupon_fixed_price',
                      label: { en: 'coupon_fixed_price' },
                      required: false,
                      type: { name: 'Number' },
                      inputHint: 'SingleLine',
                    },
                  ],
                },
              ],
            },
            statusCode: 200,
          }),
        }),
      };
    };

    const extensions = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        execute: () => ({
          catch: jest.fn().mockReturnValue({ body: { results: [] } }),
        }),
      }),
      withId: jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          execute: () => ({
            catch: jest.fn().mockReturnValue({}),
          }),
        }),
      }),
      post: jest.fn().mockReturnValue({
        execute: () => ({
          catch: jest.fn().mockReturnValue({ body: { id: undefined } }),
        }),
      }),
    });

    commerceToolsConnectoService.getClient = jest.fn().mockReturnValue({
      extensions,
      types: jest.fn().mockReturnValue({
        get,
      }),
    });

    return commerceToolsConnectoService;
  };

export const getCommerceToolsConnectorServiceMockForCommerceToolsServiceTest = (
  cart,
) => {
  const commerceToolsConnectoService = jest.createMockFromModule(
    '../../src/commercetools/commercetools-connector.service',
  ) as CommercetoolsConnectorService;

  commerceToolsConnectoService.findCart = jest.fn().mockResolvedValue(cart);
  commerceToolsConnectoService.getClient = jest.fn().mockReturnValue(jest.fn());

  return commerceToolsConnectoService;
};

export const getConfigForAPIExtensionServiceTest = () => {
  const configService =
    jest.createMockFromModule<ConfigService>('@nestjs/config');
  configService.get = jest.fn((key) => {
    if (key === 'COMMERCE_TOOLS_API_EXTENSION_KEY') {
      return '12345';
    }
    return null;
  });

  return configService;
};
