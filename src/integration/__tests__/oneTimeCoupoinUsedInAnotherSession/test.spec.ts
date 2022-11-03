import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../../commercetools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { CommercetoolsService } from '../../../commercetools/commercetools.service';
import { ProductMapper } from '../../mappers/product';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';

describe('When one-time -20€ amount voucher is provided in another cart within another session', () => {
  let commercetoolsService: CommercetoolsService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const COUPON_CODE = 'AMOUNT20';
  const NEW_SESSION_ID = 'new-session-id';

  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    ({ commercetoolsService, productMapper } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
        commerceToolsConnectorService,
      }));
  });

  it('Should call voucherify exactly once using session identifier', async () => {
    await commercetoolsService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledTimes(1);
    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledWith(
      [
        {
          code: COUPON_CODE,
          status: 'NEW',
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      NEW_SESSION_ID,
    );
  });

  it('Should return only one `setCustomField` action with information about failure', async () => {
    const result =
      await commercetoolsService.validatePromotionsAndBuildCartActions(cart);

    expect(result.actions).toEqual([
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: [
          '{"code":"AMOUNT20","status":"NOT_APPLIED","errMsg":"quantity exceeded"}',
        ],
      },
    ]);
  });
});
