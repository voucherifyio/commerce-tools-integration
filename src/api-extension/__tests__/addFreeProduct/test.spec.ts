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
          status: 'NEW',
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      SESSION_KEY,
    );
  });

  it('should create `addLineItem` action with gift product', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'addLineItem',
          sku: SKU_ID,
          quantity: 1,
          custom: {
            typeKey: 'lineItemCodesType',
            fields: {
              applied_codes: [
                JSON.stringify({
                  code: COUPON_CODE,
                  type: 'UNIT',
                  effect: 'ADD_NEW_ITEMS',
                  quantity: 1,
                  totalDiscountQuantity: 1,
                }),
              ],
            },
          },
        }),
      ]),
    );

    expect(
      result.actions.filter((e) => e.action === 'addLineItem'),
    ).toHaveLength(1);
  });

  it('should create `addLineItem` action with gift product', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'addLineItem',
          sku: SKU_ID,
          quantity: 1,
          custom: {
            typeKey: 'lineItemCodesType',
            fields: {
              applied_codes: [
                JSON.stringify({
                  code: COUPON_CODE,
                  type: 'UNIT',
                  effect: 'ADD_NEW_ITEMS',
                  quantity: 1,
                  totalDiscountQuantity: 1,
                }),
              ],
            },
          },
        }),
      ]),
    );

    expect(
      result.actions.filter((e) => e.action === 'addLineItem'),
    ).toHaveLength(1);
  });

  it('should create `addCustomLineItem` action with total coupons value applied', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

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
            centAmount: -6500,
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
    expect(
      result.actions.filter((e) => e.action === 'addCustomLineItem'),
    ).toHaveLength(1);
  });

  it('should create three `setCustomField` for default customFields settings and action storing coupon details to the cart', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

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
              value: 6500,
            }),
          ],
        }),
      ]),
    );
    expect(
      result.actions.filter((e) => e.action === 'setCustomField'),
    ).toHaveLength(3);
  });
});
