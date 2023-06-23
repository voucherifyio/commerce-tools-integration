import { CommercetoolsService } from '../commercetools.service';

export const getCommerceToolsServiceMockWithMockedResponse = (
  response?: any,
) => {
  const commerceToolsConnectoService = jest.createMockFromModule(
    '../commercetools.service',
  ) as CommercetoolsService & { getProductMock: jest.Mock };

  commerceToolsConnectoService.handleCartUpdate = jest
    .fn()
    .mockReturnValue(response);

  commerceToolsConnectoService.checkIfCartStatusIsPaidAndRedeem = jest
    .fn()
    .mockReturnValue(response);

  return commerceToolsConnectoService;
};
