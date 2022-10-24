import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../__mocks__/types.service';
import { buildCommercetoolsServiceWithMockedDependencies } from '../__mocks__/commercetools.factory';

import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { cart as cartCh } from './snapshots/cart-ch.snapshot';

describe('Tax categories', () => {
  it('should throw error if tax categories are not configured', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();

    const taxCategoriesService =
      getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse();

    const { commerceToolsService, cartHandlerMock } =
      await buildCommercetoolsServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
      });

    expect(commerceToolsService.handleApiExtension(cart)).rejects.toThrowError(
      new Error('Coupon tax category was not configured correctly'),
    );
  });

  it('Should add new country to coupon tax category if not exist', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();

    const { commerceToolsService, cartHandlerMock } =
      await buildCommercetoolsServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
      });

    await commerceToolsService.handleApiExtension(cartCh);

    expect(taxCategoriesService.getCouponTaxCategory).toBeCalledTimes(1);
    expect(taxCategoriesService.addCountryToCouponTaxCategory).toBeCalledTimes(
      1,
    );
    expect(taxCategoriesService.addCountryToCouponTaxCategory).toBeCalledWith(
      defaultGetCouponTaxCategoryResponse,
      'CH',
    );
  });

  it('Should work with one of returned tax categories for countries which already exist', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const { commerceToolsService, cartHandlerMock } =
      await buildCommercetoolsServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
      });

    commerceToolsService.handleApiExtension(cart);

    expect(taxCategoriesService.getCouponTaxCategory).toBeCalledTimes(1);
    expect(taxCategoriesService.addCountryToCouponTaxCategory).not.toBeCalled();
  });
});
