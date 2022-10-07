import { defaultCart, defaultTypeId } from './cart.mock';
import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import {
  getTypesServiceMockWithConfiguredCouponTypeResponse,
  getTypesServiceMockWithNotDefinedCouponTypeResponse,
} from '../../commerceTools/types/__mocks__/types.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';

describe('Cart custom types', () => {
  it('Should add custom coupon type for initialized cart', async () => {
    const cart = defaultCart();
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
            id: defaultTypeId,
          },
          name: 'couponCodes',
        },
      ],
    });
    expect(typesService.findCouponType).toBeCalledTimes(1);
    expect(typesService.findCouponType).toBeCalledWith('couponCodes');
  });

  it('Should throw error if "couponCodes" type is not found', async () => {
    const cart = defaultCart();
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
