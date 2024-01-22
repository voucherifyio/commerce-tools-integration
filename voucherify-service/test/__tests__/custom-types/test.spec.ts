import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../__mocks__/tax-categories.service';
import {
  getTypesServiceMockWithConfiguredCouponTypeResponse,
  getTypesServiceMockWithNotDefinedCouponTypeResponse,
} from '../../__mocks__/types.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
describe('Cart custom custom-types', () => {
  it('Should add custom coupon type for initialized cart', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
      });

    const result = await commercetoolsService.setCustomTypeForInitializedCart();

    expect(result).toEqual({
      status: true,
      actions: [
        {
          action: 'setCustomType',
          type: {
            id: '5aa76235-9d61-41c7-9d57-278b2bcc2f75',
          },
          name: 'couponCodes',
        },
      ],
    });
    expect(typesService.findCouponType).toBeCalledTimes(1);
    expect(typesService.findCouponType).toBeCalledWith('couponCodes');
  });

  it('Should throw error if "couponCodes" type is not found', async () => {
    const typesService = getTypesServiceMockWithNotDefinedCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
      });

    expect(
      commercetoolsService.setCustomTypeForInitializedCart(),
    ).rejects.toThrowError(new Error('CouponType not found'));
  });
});
