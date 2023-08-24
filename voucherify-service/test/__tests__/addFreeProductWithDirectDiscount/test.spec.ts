import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { getConfigServiceMockWithConfiguredDirectDiscount } from '../../__mocks__/config-service.service';
import { ConfigService } from '@nestjs/config';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';
describe('when applying discount code which adds free product to the cart', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;
  let configService: ConfigService;
  const COUPON_CODE = 'ADD_GIFT';
  const SKU_ID = 'gift-sku-id';
  const PRODUCT_ID = '7c66ebdb-446d-4ea5-846e-80463a356ef2';
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
    configService = getConfigServiceMockWithConfiguredDirectDiscount();

    ({ commercetoolsService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
      configService,
    }));
  });

  it('should call voucherify twice', async () => {
    await commercetoolsService.handleCartUpdate(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchers,
    ).toBeCalledTimes(2);
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

  it('should create `addLineItem` action with gift product', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

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

  it('should create `setDirectDiscount` action with total coupons value applied', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

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

  it('should create three `setCustomField` for default customFields settings and action storing coupon details to the cart', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

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
