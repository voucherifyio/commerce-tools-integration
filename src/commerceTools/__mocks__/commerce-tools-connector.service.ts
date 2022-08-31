import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
// import { ByProjectKeyRequestBuilder } from '../../../node_modules/@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';

// type MockedCommerceToolsConectorService = CommerceToolsConnectorService;

// class ByProjectKeyRequestBuilder {

// }

// const ByProjectKeyRequestBuilder = jest.genMockFromModule('@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder')
// type tmp = Omit<ByProjectKeyRequestBuilder, "carts">;
interface MockedCommerceToolsConectorService
  extends CommerceToolsConnectorService {
  __simulateGetClient: () => MockedCommerceToolsConectorService;
  // getClient: () => tmp;
}

const prods = {
  body: {
    results: [
      {
        id: '2aacfe19-2006-4cf6-9dde-0c402b4b1191',
        version: 1,
        lastMessageSequenceNumber: 1,
        createdAt: '2022-07-04T12:02:50.273Z',
        lastModifiedAt: '2022-07-04T12:02:50.273Z',
        lastModifiedBy: {
          clientId: 'GMdpW7TZT-9Sw2w7MU0zjpNo',
          isPlatformClient: false,
        },
        createdBy: {
          clientId: 'GMdpW7TZT-9Sw2w7MU0zjpNo',
          isPlatformClient: false,
        },
        productType: {
          typeId: 'product-type',
          id: '1cfdd252-0374-466a-ae5f-b61d3527c033',
        },
        masterData: {
          current: {
            name: {
              en: 'Sweater “Dayton“ Crossley blue',
              de: 'Pullover „Dayton“ Crossley blau',
            },
            categories: [
              {
                typeId: 'category',
                id: 'cb21d180-4a22-476d-aae7-6f9d6d2d53cd',
              },
              {
                typeId: 'category',
                id: '99974ea2-c8d8-475d-88b9-678abd2e46fc',
              },
            ],
            categoryOrderHints: {},
            slug: {
              en: 'crossley-dayton-1016-sweater-blue',
              de: 'crossley-dayton-1016-pullover-blau',
            },
            masterVariant: {
              id: 1,
              sku: 'M0E20000000EE0V',
              key: 'M0E20000000EE0V',
              prices: [
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
              ],
              images: [[Object]],
              attributes: [
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
                [Object],
              ],
              price: {
                id: '98cdedaa-d464-4c2d-a900-77ebaf1f8d6b',
                value: {
                  type: 'centPrecision',
                  currencyCode: 'EUR',
                  centAmount: 22900,
                  fractionDigits: 2,
                },
                country: 'DE',
              },
              assets: [],
            },
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
                images: [Array],
                attributes: [Array],
                price: [Object],
                assets: [],
              },
              {
                id: 3,
                sku: 'M0E20000000EE0X',
                key: 'M0E20000000EE0X',
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
                images: [Array],
                attributes: [Array],
                price: [Object],
                assets: [],
              },
              {
                id: 4,
                sku: 'M0E20000000EE0Y',
                key: 'M0E20000000EE0Y',
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
                images: [Array],
                attributes: [Array],
                price: [Object],
                assets: [],
              },
              {
                id: 5,
                sku: 'M0E20000000EE0Z',
                key: 'M0E20000000EE0Z',
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
                images: [Array],
                attributes: [Array],
                price: [Object],
                assets: [],
              },
              {
                id: 6,
                sku: 'M0E20000000EE10',
                key: 'M0E20000000EE10',
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
                images: [Array],
                attributes: [Array],
                price: [Object],
                assets: [],
              },
              {
                id: 7,
                sku: 'M0E20000000EE11',
                key: 'M0E20000000EE11',
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
                images: [Array],
                attributes: [Array],
                price: [Object],
                assets: [],
              },
              {
                id: 8,
                sku: 'M0E20000000EE12',
                key: 'M0E20000000EE12',
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
                images: [Array],
                attributes: [Array],
                price: [Object],
                assets: [],
              },
            ],
            searchKeywords: {},
          },
          // staged: [Object],
          published: true,
          hasStagedChanges: false,
        },
        taxCategory: {
          typeId: 'tax-category',
          id: '292c178c-04e3-4ea5-9778-2eb5da6eff09',
        },
        lastVariantId: 8,
      },
    ],
  },
};

const commerceToolsConnectoService = jest.createMockFromModule(
  '../commerce-tools-connector.service',
) as MockedCommerceToolsConectorService;

commerceToolsConnectoService.__simulateGetClient = () => {
  commerceToolsConnectoService.getClient = jest.fn(() => {
    return {
      products: jest.fn(() => {
        return {
          get: jest.fn(() => {
            return {
              execute: jest.fn(() => {
                return prods;
                // return {
                //   body: {
                //     results: ['dd'],
                //     masterData: {
                //       current: {
                //         variants: [{sku: 'dddd'},{sku: 'eee'},{sku: 'sssss'},{sku: 'zzzz'}]
                //       }
                //     }
                //   }
                // }
              }),
            };
          }),
        };
      }),
    } as unknown as ByProjectKeyRequestBuilder;
    // let x: tmp;
    // return x
    // return new ByProjectKeyRequestBuilder({
    //   pathArgs: {
    //     projectKey: 'dddd',
    //   },
    //   executeRequest: () =>
    //     Promise.resolve({
    //       body: {},
    //       statusCode: 200,
    //       headers: {},
    //     }),
    //   baseUri: 'ddddd',
    // });
  });

  return commerceToolsConnectoService;
};

export {
  commerceToolsConnectoService as CommerceToolsConnectorService,
  MockedCommerceToolsConectorService,
};
