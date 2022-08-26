import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';

type MockedCommerceToolsConectorService = CommerceToolsConnectorService;

const commerceToolsConnectoService = jest.createMockFromModule(
  '../commerce-tools-connector.service',
) as MockedCommerceToolsConectorService;

export {
  commerceToolsConnectoService as CommerceToolsConnectorService,
  MockedCommerceToolsConectorService,
};
