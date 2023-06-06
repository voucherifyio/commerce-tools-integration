import { CommercetoolsConnectorService } from '../commercetools-connector.service';

export const getCommerceToolsConnectorServiceMockWithEmptyProductResponse =
  () => {
    const commerceToolsConnectoService = jest.createMockFromModule(
      '../commercetools-connector.service',
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
    '../commercetools-connector.service',
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
        execute: jest.fn().mockReturnValue(products),
      }),
    }),
    taxCategories,
    get: jest.fn().mockReturnValue({
      execute: jest.fn().mockReturnValue(getClientResponse),
    }),
  });

  return commerceToolsConnectorService;
};
