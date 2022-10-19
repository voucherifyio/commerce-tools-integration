import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import {
  getTypesServiceMockWithConfiguredCouponTypeResponse,
  getTypesServiceMockWithNotDefinedCouponTypeResponse,
} from '../../../commerceTools/types/__mocks__/types.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { cart } from './snapshots/cart.snapshot';
describe('Cart custom types', () => {
  it('Should add custom coupon type for initialized cart', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
    });

    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

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

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
    });

    expect(
      cartService.validatePromotionsAndBuildCartActions(cart),
    ).rejects.toThrowError(new Error('CouponType not found'));
  });
});