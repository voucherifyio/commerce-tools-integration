import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
interface MockedCommerceToolsConectorService
  extends CommerceToolsConnectorService {
  __simulateGetClient: (props?: any) => MockedCommerceToolsConectorService;
}

export const getCommerceToolsConnectorServiceMockWithResponse = () => {
  const commerceToolsConnectoService = jest.createMockFromModule(
    '../commerce-tools-connector.service',
  ) as CommerceToolsConnectorService;

  const products: any = {
    body: {
      results: [
        {
          id: '2aacfe19-2006-4cf6-9dde-0c402b4b1191',
          masterData: {
            current: {
              variants: [
                {
                  id: 2,
                  sku: 'M0E20000000EE0W',
                  key: 'M0E20000000EE0W',
                  prices: [
                    {
                      id: 'a04f9ae5-fe60-4459-b26c-7461200a0109',
                      value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 28625,
                        fractionDigits: 2,
                      },
                    },
                    {
                      id: 'd474a958-c1d9-4523-85fe-b962df0312b0',
                      value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 18770,
                        fractionDigits: 2,
                      },
                      customerGroup: {
                        typeId: 'customer-group',
                        id: '449b547f-cc6f-4399-983d-27475a00b3f7',
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

  commerceToolsConnectoService.getClient = jest.fn().mockReturnValue({
    products: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        execute: jest.fn().mockReturnValue(products),
      }),
    }),
  });

  return commerceToolsConnectoService;
};

const commerceToolsConnectoService = jest.createMockFromModule(
  '../commerce-tools-connector.service',
) as MockedCommerceToolsConectorService;

commerceToolsConnectoService.__simulateGetClient = (props: any = {}) => {
  let products: any = {
    body: {
      results: [
        {
          id: '2aacfe19-2006-4cf6-9dde-0c402b4b1191',
          masterData: {
            current: {
              variants: [
                {
                  id: 2,
                  sku: 'M0E20000000EE0W',
                  key: 'M0E20000000EE0W',
                  prices: [
                    {
                      id: 'a04f9ae5-fe60-4459-b26c-7461200a0109',
                      value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 28625,
                        fractionDigits: 2,
                      },
                    },
                    {
                      id: 'd474a958-c1d9-4523-85fe-b962df0312b0',
                      value: {
                        type: 'centPrecision',
                        currencyCode: 'EUR',
                        centAmount: 18770,
                        fractionDigits: 2,
                      },
                      customerGroup: {
                        typeId: 'customer-group',
                        id: '449b547f-cc6f-4399-983d-27475a00b3f7',
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

  if (Object.keys(props).length) {
    products = {
      body: {
        results: [
          {
            id: props.id,
            masterData: {
              current: {
                variants: [
                  {
                    sku: props.sku,
                    prices: [
                      {
                        value: {
                          centAmount: props.price,
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
  }

  commerceToolsConnectoService.getClient = jest.fn(() => {
    return {
      products: jest.fn(() => {
        return {
          get: jest.fn(() => {
            return {
              execute: jest.fn(() => {
                return products;
              }),
            };
          }),
        };
      }),
    } as unknown as ByProjectKeyRequestBuilder;
  });

  return commerceToolsConnectoService;
};

export {
  commerceToolsConnectoService as CommerceToolsConnectorService,
  MockedCommerceToolsConectorService,
};
