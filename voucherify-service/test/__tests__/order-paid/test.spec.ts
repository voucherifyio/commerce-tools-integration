import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../__mocks__/types.service';
import { CommercetoolsService } from 'src/commercetools/commercetools.service';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithEmptyProductResponse } from '../../__mocks__/commerce-tools-connector.service';
import { redeemStackableResponse } from './snapshots/redeemStackableResponse.snapshot';
import { orderPaidWithoutCustomCodesResponse } from './snapshots/orderPaidWithoutCustomCodesResponse.snapshot';
import { orderPaidWithCustomCodesResponse } from './snapshots/orderPaidWithCustomCodesResponse.snapshot';
import { redeemStackableRequest } from './snapshots/redeemStackableRequest.snapshot';
import { mapItemsToVoucherifyOrdersItems } from '../../../src/integration/utils/mappers/product';
import { translateCtOrderToOrder } from '../../../src/commercetools/utils/mappers/translateCtOrderToOrder';

describe('When order is paid', () => {
  let voucherifyConnectorService: VoucherifyConnectorService;
  let commercetoolsService: CommercetoolsService;
  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(
        redeemStackableResponse,
      );
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithEmptyProductResponse();

    ({ commercetoolsService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    }));
  });

  it('Should not redeem stackable vouchers with creating an order', async () => {
    const result = await commercetoolsService.checkIfCartStatusIsPaidAndRedeem(
      orderPaidWithoutCustomCodesResponse,
    );
    const integrationOrder = translateCtOrderToOrder(
      orderPaidWithoutCustomCodesResponse,
    );

    expect(voucherifyConnectorService.redeemStackableVouchers).toBeCalledTimes(
      0,
    );
    expect(voucherifyConnectorService.createOrder).toBeCalledTimes(1);
    expect(result).toBeUndefined();
    expect(voucherifyConnectorService.createOrder).toBeCalledWith(
      integrationOrder,
      mapItemsToVoucherifyOrdersItems(integrationOrder.items),
      {},
    );
  });

  it('Should redeem stackable vouchers only one without creating an order', async () => {
    const result = await commercetoolsService.checkIfCartStatusIsPaidAndRedeem(
      orderPaidWithCustomCodesResponse,
    );

    expect(voucherifyConnectorService.redeemStackableVouchers).toBeCalledTimes(
      1,
    );
    expect(voucherifyConnectorService.redeemStackableVouchers).toBeCalledWith(
      redeemStackableRequest,
    );
    expect(voucherifyConnectorService.createOrder).toBeCalledTimes(0);
    expect(result).toBeUndefined();
  });
});
