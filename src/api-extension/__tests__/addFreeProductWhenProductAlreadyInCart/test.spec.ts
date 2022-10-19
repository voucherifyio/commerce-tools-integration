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
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
describe('when adding new product to the cart with free product already applied (via coupon)', () => {
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

    ({ cartService, productMapper } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
        commerceToolsConnectorService,
      }));
  });

  it('should call voucherify once', async () => {
    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledTimes(1);
    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledWith(
      [
        {
          code: 'ADD_GIFT',
          status: 'APPLIED',
          value: 6500,
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      SESSION_KEY,
    );
  });

  it('should create one `addCustomLineItem` action with summary of applied coupon', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(
      result.actions.filter((e) => e.action === 'addCustomLineItem'),
    ).toHaveLength(1);

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'addCustomLineItem',
          name: {
            de: 'Gutscheincodes rabatt',
            en: 'Coupon codes discount',
          },
          quantity: 1,
          money: {
            centAmount: -PRODUCT_PRICE,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: 'Voucher, ',
          taxCategory: {
            id: defaultGetCouponTaxCategoryResponse.id,
          },
        }),
      ]),
    );
  });

  it('should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(
      result.actions.filter((e) => e.action === 'setCustomField'),
    ).toHaveLength(3);

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            JSON.stringify({
              code: COUPON_CODE,
              status: 'APPLIED',
              type: 'voucher',
              value: PRODUCT_PRICE,
            }),
          ],
        }),
      ]),
    );
  });
});
