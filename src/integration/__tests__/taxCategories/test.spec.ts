import {
  defaultGetCouponTaxCategoryResponse,
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse,
} from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { cartCh } from './snapshots/cart-ch.snapshot';
describe('Tax categories', () => {
  it('should throw error if tax categories are not configured', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
      });

    await expect(
      commercetoolsService.validatePromotionsAndBuildCartActions(cart),
    ).rejects.toThrowError(
      new Error('Coupon tax category was not configured correctly'),
    );
  });
  it('Should add new country to coupon tax category if not exist', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
      });

    await commercetoolsService.validatePromotionsAndBuildCartActions(cartCh);

    expect(
      taxCategoriesService.getCouponTaxCategoryFromResponse,
    ).toBeCalledTimes(2);
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
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
      });

    await commercetoolsService.validatePromotionsAndBuildCartActions(cart);

    expect(
      taxCategoriesService.getCouponTaxCategoryFromResponse,
    ).toBeCalledTimes(1);
    expect(taxCategoriesService.addCountryToCouponTaxCategory).not.toBeCalled();
  });
});