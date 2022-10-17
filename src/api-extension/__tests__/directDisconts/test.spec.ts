import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { CartService } from '../../cart.service';
import { ProductMapper } from '../../mappers/product';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { cart } from './snapshots/cart.snapshot';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
describe('when applying discount code which adds free product to the cart', () => {
  let cartService: CartService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const COUPON_CODE = 'ADD_GIFT';
  const SKU_ID = 'gift-sku-id';
  const PRODUCT_ID = 'gift-product-id';
  const SESSION_KEY = 'existing-session-id';
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

    ({ cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    }));
  });

  it('It should create `setDirectDiscounts` action with 1 discount object in it.', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
      true,
    );

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'setDirectDiscounts',
          discounts: [
            {
              target: { predicate: 'sku="gift-sku-id"', type: 'lineItems' },
              value: {
                money: [{ centAmount: 6500, currencyCode: 'EUR' }],
                type: 'absolute',
              },
            },
          ],
        }),
      ]),
    );

    expect(
      result.actions.filter((e) => e.action === 'setDirectDiscounts'),
    ).toHaveLength(1);
  });
});
