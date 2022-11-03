import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
describe('Tax categories', () => {
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
      taxCategoriesService.checkCouponTaxCategoryWithCountries,
    ).toBeCalledTimes(1);
    expect(taxCategoriesService.addCountryToCouponTaxCategory).not.toBeCalled();
  });
});
