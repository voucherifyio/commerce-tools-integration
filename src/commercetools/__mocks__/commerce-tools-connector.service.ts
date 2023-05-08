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

  commerceToolsConnectorService.getClient = jest.fn().mockReturnValue({
    products: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        execute: jest.fn().mockReturnValue(products),
      }),
    }),
  });

  return commerceToolsConnectorService;
};
