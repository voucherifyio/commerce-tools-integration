import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
// import { ByProjectKeyRequestBuilder } from '../../../node_modules/@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';

// type MockedCommerceToolsConectorService = CommerceToolsConnectorService;
interface MockedCommerceToolsConectorService
  extends CommerceToolsConnectorService {
  __simulateGetClient: () => MockedCommerceToolsConectorService;
}

const commerceToolsConnectoService = jest.createMockFromModule(
  '../commerce-tools-connector.service',
) as MockedCommerceToolsConectorService;

commerceToolsConnectoService.__simulateGetClient = () => {
  commerceToolsConnectoService.getClient = jest.fn(() => {
    return new ByProjectKeyRequestBuilder({
      // args: {
      pathArgs: {
        projectKey: 'dddd',
      },
      executeRequest: () =>
        Promise.resolve({
          body: {},
          statusCode: 200,
          headers: {},
        }),
      baseUri: 'ddddd',
      // }
    });
  });

  return commerceToolsConnectoService;
};

export {
  commerceToolsConnectoService as CommerceToolsConnectorService,
  MockedCommerceToolsConectorService,
};
