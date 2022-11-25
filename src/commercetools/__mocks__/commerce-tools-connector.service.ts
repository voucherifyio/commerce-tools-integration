import { CommercetoolsConnectorService } from '../commercetools-connector.service';

export const getCommerceToolsConnectorServiceMockWithResponse = () => {
  const commerceToolsConnectoService = jest.createMockFromModule(
    '../commercetools-connector.service',
  ) as CommercetoolsConnectorService;

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

type Product = {
  sku: string;
  price: number;
  id: string;
};
export const getCommerceToolsConnectorServiceMockWithProductResponse = (
  product: Product,
) => {
  const commerceToolsConnectoService = jest.createMockFromModule(
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

  commerceToolsConnectoService.getClient = jest.fn().mockReturnValue(null);

  commerceToolsConnectoService.getClient = jest.fn().mockReturnValue({
    products: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        execute: jest.fn().mockReturnValue(products),
      }),
    }),
  });

  return commerceToolsConnectoService;
};
