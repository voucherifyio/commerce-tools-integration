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
  const SKU_ID = '3525f646-e4ea-48bd-b925-a327dbc50f99';
  const PRODUCT_ID = '8196593a-7e3e-464f-95eb-ccfdc5e51a35';
  const PRODUCT_PRICE = 64900;

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

  it('after adding 10$ coupon, we get noa additional discount due coupons rules', async () => {
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
            target: { type: 'lineItems', predicate: 'sku="A0E200000001UTR"' },
            value: {
              type: 'absolute',
              money: [{ centAmount: 64900, currencyCode: 'EUR' }],
            },
          },
          {
            target: { type: 'lineItems', predicate: 'true' },
            value: {
              type: 'absolute',
              money: [{ centAmount: 51270, currencyCode: 'EUR' }],
            },
          },
        ],
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: 'b052221f-fbf0-49a4-ad28-b6618abd5368',
        type: { key: 'lineItemCodesType' },
        fields: {},
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: '3525f646-e4ea-48bd-b925-a327dbc50f99',
        type: { key: 'lineItemCodesType' },
        fields: {
          applied_codes: [
            '{"code":"unit_off_1","type":"UNIT","effect":"ADD_MISSING_ITEMS","quantity":1,"totalDiscountQuantity":1}',
          ],
        },
      },
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: [
          '{"code":"30%off","status":"APPLIED","type":"voucher","value":51270}',
          '{"code":"unit_off_1","status":"APPLIED","type":"voucher","value":64900}',
          '{"code":"10off-Handbag","status":"APPLIED","type":"voucher","value":0}',
        ],
      },
      {
        action: 'setCustomField',
        name: 'shippingProductSourceIds',
        value: ['8196593a-7e3e-464f-95eb-ccfdc5e51a35'],
      },
      { action: 'setCustomField', name: 'couponsLimit', value: 30 },
    ]);
  });
});
