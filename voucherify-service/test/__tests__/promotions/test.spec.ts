import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../__mocks__/tax-categories.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { promotions } from './snapshots/voucherify-promotions.snapshot';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../__mocks__/types.service';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';

describe('when adding a promotion to a cart', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const SKU_ID = 'gift-sku-id';
  const PRODUCT_ID = '260d2585-daef-4c11-9adb-1b90099b7ae8';
  const PRODUCT_PRICE = 6500;

  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(
        voucherifyResponse,
        promotions,
      );
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

  it('we should not mix promotion ID with promotion banner', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            '{"code":"promo_Y4lMzNB8H69GojnLyF3hJZXP","banner":"Promotion A1 tier 1","status":"APPLIED","type":"promotion_tier","value":1000}',
            '{"status":"AVAILABLE","value":1000,"banner":"Promotion A2 tier 1","code":"promo_LP8KQR34UHK5b1UWeBH62FS2","type":"promotion_tier"}',
            '{"status":"AVAILABLE","value":10600,"banner":"Over 300EUR off","code":"promo_O2WtQixJ6WbXy0KRNG24S51Y","type":"promotion_tier"}',
          ],
        }),
      ]),
    );
  });
});
