import { CommercetoolsService } from '../commercetools.service';

export const getCommerceToolsServiceMockWithEmptyProductResponse = () => {
  const commerceToolsConnectoService = jest.createMockFromModule(
    '../commercetools.service',
  ) as CommercetoolsService & { getProductMock: jest.Mock };

  commerceToolsConnectoService.handleCartUpdate = jest.fn().mockReturnValue({});

  commerceToolsConnectoService.checkIfCartStatusIsPaidAndRedeem = jest
    .fn()
    .mockReturnValue(undefined);

  return commerceToolsConnectoService;
};
