import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';

describe('when adding new product to the cart with free product already applied (via coupon)', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const SKU_ID = 'gift-sku-id';
  const PRODUCT_ID = '7c66ebdb-446d-4ea5-846e-80463a356ef2'; //gift-product-id
  const PRODUCT_PRICE = 6500;

  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithProductResponse({
        sku: SKU_ID,
        price: PRODUCT_PRICE,
        id: PRODUCT_ID,
      });

    ({ commercetoolsService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    }));
  });

  it('should call voucherify twice', async () => {
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
        redeemables: [{ id: 'ADD_GIFT', object: 'voucher' }],
        session: { key: 'existing-session-id', type: 'LOCK' },
      },
    );
  });

  it('should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(
      result.actions.filter((e) => e.action === 'setCustomField'),
    ).toHaveLength(2);

    expect(result.actions.filter((e) => e.action === 'setCustomField')).toEqual(
      [
        { action: 'setCustomField', name: 'discount_codes', value: [] },
        {
          action: 'setCustomField',
          name: 'shippingProductSourceIds',
          value: [],
        },
      ],
    );
  });
});
