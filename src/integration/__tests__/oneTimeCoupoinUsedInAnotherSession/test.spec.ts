import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/custom-types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithEmptyProductResponse } from '../../../commercetools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { CommercetoolsService } from '../../../commercetools/commercetools.service';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';

describe('When one-time -20€ amount voucher is provided in another cart within another session', () => {
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

  it('Should call voucherify exactly once using session identifier', async () => {
    await commercetoolsService.handleCartUpdate(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchers,
    ).toBeCalledTimes(1);
    expect(voucherifyConnectorService.validateStackableVouchers).toBeCalledWith(
      {
        customer: { source_id: undefined },
        order: {
          amount: 26500,
          customer: { source_id: undefined },
          discount_amount: 0,
          items: [
            {
              amount: 26500,
              price: 26500,
              product: { name: 'Some product', override: true },
              quantity: 1,
              related_object: 'sku',
              sku: { metadata: {}, override: true, sku: 'Some product' },
              source_id: 'product-sku1',
            },
          ],
          source_id: 'cart-id',
        },
        redeemables: [
          {
            id: 'AMOUNT20',
            object: 'voucher',
          },
        ],
        session: { key: 'new-session-id', type: 'LOCK' },
      },
    );
  });

  it('Should return only one `setCustomField` action with information about failure', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(result.actions).toEqual(
      expect.arrayContaining([
        {
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            '{"code":"AMOUNT20","status":"NOT_APPLIED","errMsg":"quantity exceeded"}',
          ],
        },
      ]),
    );
  });
});
