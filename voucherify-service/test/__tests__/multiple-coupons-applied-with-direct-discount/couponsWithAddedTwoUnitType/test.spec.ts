import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../__mocks__/tax-categories.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { getConfigServiceMockWithConfiguredDirectDiscount } from '../../../__mocks__/config-service.service';
import { ConfigService } from '@nestjs/config';
import { Cart } from '@commercetools/platform-sdk';
import { CommercetoolsService } from '../../../../src/commercetools/commercetools.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../__mocks__/types.service';
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

  it('after adding unit type coupon with unit value 2 as last it should create `setDirectDiscounts` action', async () => {
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
              money: [{ centAmount: 18550, currencyCode: 'EUR' }],
            },
          },
          {
            target: { type: 'lineItems', predicate: 'sku="M0E20000000DUJ6"' },
            value: {
              type: 'absolute',
              money: [{ centAmount: 7950, currencyCode: 'EUR' }],
            },
          },
          {
            target: { type: 'lineItems', predicate: 'true' },
            value: {
              type: 'absolute',
              money: [{ centAmount: 3101, currencyCode: 'EUR' }],
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
        action: 'changeLineItemQuantity',
        lineItemId: '939bf618-c4cf-4e11-ae35-034c4b1860d2',
        quantity: 3,
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: '9ea34a33-36cf-479e-bba6-18644ea181c5',
        type: { key: 'lineItemCodesType' },
        fields: {},
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: '939bf618-c4cf-4e11-ae35-034c4b1860d2',
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
        name: 'session',
        value: 'ssn_dfvEVD2mxx9O5WyMrnOuU7okp9EUjmHM',
      },
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: [
          '{"code":"X_3%_OFF","status":"APPLIED","type":"voucher","value":3101}',
          '{"code":"X_10%_OFF","status":"APPLIED","type":"voucher","value":10335}',
          '{"code":"UNIT_TYPE_OFF","status":"APPLIED","type":"voucher","value":18550}',
          '{"code":"UNIT_TYPE_OFF_2","status":"APPLIED","type":"voucher","value":53000}',
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
