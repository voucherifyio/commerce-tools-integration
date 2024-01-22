import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/custom-types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithEmptyProductResponse } from '../../../commercetools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';

import { CommercetoolsService } from '../../../commercetools/commercetools.service';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { VoucherifyConnectorService } from '../../../voucherify/voucherify-connector.service';
describe('When partial redeem is enabled and trying to apply inexistent coupon code', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;

  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithEmptyProductResponse();

    ({ commercetoolsService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    }));
  });

  it('should call voucherify exactly once', async () => {
    await commercetoolsService.handleCartUpdate(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchers,
    ).toBeCalledTimes(1);
  });

  it('Should return only one `setCustomField` action with information about failure', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);
    expect(
      result.actions.find(
        (actionItem) =>
          actionItem.action === 'setCustomField' &&
          actionItem.name === 'discount_codes',
      ),
    ).toEqual({
      action: 'setCustomField',
      name: 'discount_codes',
      value: [
        '{"code":"PERC10","status":"APPLIED","type":"voucher","value":2650}',
        '{"code":"AMOUNT20","status":"APPLIED","type":"voucher","value":2000}',
        '{"code":"NOT-EXISTING","status":"NOT_APPLIED","errMsg":"Resource not found"}',
      ],
    });
  });
});
