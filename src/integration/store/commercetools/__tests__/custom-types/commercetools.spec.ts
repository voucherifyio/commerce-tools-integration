import { CommercetoolsService } from '../../commercetools.service';
import { TypesService } from '../../types.service';
import { buildCommercetoolsServiceWithMockedDependencies } from '../__mocks__/commercetools.factory';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../__mocks__/types.service';
import { cart } from './cart.snapshot';

describe('Set Cart custom types for initialized cart', () => {
  let typesService: TypesService;
  let commerceToolsService: CommercetoolsService;
  let cartHandlerMock: jest.Mock;

  beforeEach(async () => {
    typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    ({ commerceToolsService, cartHandlerMock } =
      await buildCommercetoolsServiceWithMockedDependencies({ typesService }));
  });

  it('Should not provide request to integration layer', async () => {
    await commerceToolsService.handleApiExtension(cart);
    expect(cartHandlerMock).toBeCalledTimes(0);
  });

  it('Should add custom coupon type for initialized cart', async () => {
    expect(await commerceToolsService.handleApiExtension(cart)).toEqual([
      {
        action: 'setCustomType',
        type: {
          id: '5aa76235-9d61-41c7-9d57-278b2bcc2f75',
        },
        name: 'couponCodes',
      },
    ]);
    expect(typesService.findCouponType).toBeCalledTimes(1);
    expect(typesService.findCouponType).toBeCalledWith('couponCodes');
  });
});
