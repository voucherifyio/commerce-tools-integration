import { CommercetoolsService } from '../../src/commercetools/commercetools.service';

export const getCommerceToolsServiceMockWithMockedResponse = (
  response?: any,
) => {
  const commerceToolsConnectoService = jest.createMockFromModule(
    '../../src/commercetools/commercetools.service',
  ) as CommercetoolsService & { getProductMock: jest.Mock };

  commerceToolsConnectoService.handleCartUpdate = jest
    .fn()
    .mockReturnValue(response);

  commerceToolsConnectoService.checkIfCartStatusIsPaidAndRedeem = jest
    .fn()
    .mockReturnValue(response);

  return commerceToolsConnectoService;
};
