import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/custom-types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithEmptyProductResponse } from '../../../commercetools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';

import { CommercetoolsService } from '../../../commercetools/commercetools.service';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { VoucherifyConnectorService } from '../../../voucherify/voucherify-connector.service';
describe('When trying to apply inexistent coupon code', () => {
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

  it('Should call voucherify exactly once', async () => {
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
        redeemables: [{ id: 'NOT EXIST', object: 'voucher' }],
        session: { type: 'LOCK' },
      },
    );
  });

  it('Should return only one `setCustomField` action with information about failure', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(result).toEqual({
      status: true,
      actions: [
        {
          action: 'setLineItemCustomType',
          lineItemId: 'line-item-id-2',
          type: { key: 'lineItemCodesType' },
          fields: {},
        },
        {
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            '{"code":"NOT EXIST","status":"NOT_APPLIED","errMsg":"Resource not found"}',
          ],
        },
        {
          action: 'setCustomField',
          name: 'shippingProductSourceIds',
          value: [],
        },
        { action: 'setCustomField', name: 'couponsLimit', value: 5 },
      ],
    });
  });
});
