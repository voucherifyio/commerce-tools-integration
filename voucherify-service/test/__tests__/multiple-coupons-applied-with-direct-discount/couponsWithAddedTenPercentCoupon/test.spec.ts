import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../__mocks__/tax-categories.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { getConfigServiceMockWithConfiguredDirectDiscount } from '../../../__mocks__/config-service.service';
import { ConfigService } from '@nestjs/config';
import { Cart } from '@commercetools/platform-sdk';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../__mocks__/types.service';
import { CommercetoolsService } from '../../../../src/commercetools/commercetools.service';
import { VoucherifyConnectorService } from '../../../../src/voucherify/voucherify-connector.service';
describe('when applying discount code which adds free product to the cart', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;
  let configService: ConfigService;
  const SKU_ID = 'gift-sku-id';
  const PRODUCT_ID = '260d2585-daef-4c11-9adb-1b90099b7ae8';
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

  it('after adding 10% coupon as last it should create `setDirectDiscounts` action', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart as Cart);

    expect(result.actions).toEqual([
      {
        action: 'setCustomType',
        type: { id: '5aa76235-9d61-41c7-9d57-278b2bcc2f75' },
        name: 'couponCodes',
      },
      {
        action: 'setDirectDiscounts',
        discounts: [
          {
            target: { type: 'lineItems', predicate: 'sku="M0E20000000DUJ6"' },
            value: {
              type: 'absolute',
              money: [{ centAmount: 53000, currencyCode: 'EUR' }],
            },
          },
          {
            target: { type: 'lineItems', predicate: 'sku="M0E20000000DUJ6"' },
            value: {
              type: 'absolute',
              money: [{ centAmount: 26500, currencyCode: 'EUR' }],
            },
          },
          {
            target: { type: 'lineItems', predicate: 'true' },
            value: {
              type: 'absolute',
              money: [{ centAmount: 2385, currencyCode: 'EUR' }],
            },
          },
        ],
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: '47705da2-d54d-47f5-a8b3-d3ff227b99b5',
        type: { key: 'lineItemCodesType' },
        fields: {},
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: 'eb414919-dfe2-4d21-8680-5d6f73707194',
        type: { key: 'lineItemCodesType' },
        fields: {
          applied_codes: [
            '{"code":"UNIT_TYPE_OFF","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":1,"totalDiscountQuantity":3}',
            '{"code":"UNIT_TYPE_OFF_2","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":2,"totalDiscountQuantity":3}',
          ],
        },
      },
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: [
          '{"code":"UNIT_TYPE_OFF","status":"APPLIED","type":"voucher","value":26500}',
          '{"code":"UNIT_TYPE_OFF_2","status":"APPLIED","type":"voucher","value":53000}',
          '{"code":"X_10%_OFF","status":"APPLIED","type":"voucher","value":2385}',
        ],
      },
      {
        action: 'setCustomField',
        name: 'shippingProductSourceIds',
        value: ['260d2585-daef-4c11-9adb-1b90099b7ae8'],
      },
      { action: 'setCustomField', name: 'couponsLimit', value: 30 },
    ]);
  });
});
