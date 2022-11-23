import {
  defaultGetCouponTaxCategoryResponse,
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse,
} from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/custom-types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { cartCh } from './snapshots/cart-ch.snapshot';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../../commercetools/__mocks__/commerce-tools-connector.service';
describe('Tax categories', () => {
  it('should throw error if tax categories are not configured', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
        commerceToolsConnectorService,
      });

    await expect(
      commercetoolsService.handleCartUpdate(cart),
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
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
        commerceToolsConnectorService,
      });

    await commercetoolsService.handleCartUpdate(cartCh);

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
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    const { commercetoolsService } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        commerceToolsConnectorService,
        voucherifyConnectorService,
      });

    await commercetoolsService.handleCartUpdate(cart);

    expect(
      taxCategoriesService.getCouponTaxCategoryFromResponse,
    ).toBeCalledTimes(1);
    expect(taxCategoriesService.addCountryToCouponTaxCategory).not.toBeCalled();
  });
});
