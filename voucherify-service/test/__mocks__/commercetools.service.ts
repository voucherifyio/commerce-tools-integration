import { CommercetoolsService } from '../../src/commercetools/commercetools.service';

export const getCommerceToolsServiceMockWithMockedResponse = (
  response?: any,
) => {
  const commerceToolsConnectorService = jest.createMockFromModule(
    '../../src/commercetools/commercetools.service',
  ) as CommercetoolsService & { getProductMock: jest.Mock };

  commerceToolsConnectorService.handleCartUpdate = jest
    .fn()
    .mockReturnValue(response);

  commerceToolsConnectorService.checkIfCartStatusIsPaidAndRedeem = jest
    .fn()
    .mockReturnValue(response);

  return commerceToolsConnectorService;
};
