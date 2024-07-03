import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../__mocks__/tax-categories.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { CommercetoolsService } from '../../../../src/commercetools/commercetools.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../__mocks__/types.service';
import { VoucherifyConnectorService } from '../../../../src/voucherify/voucherify-connector.service';

describe('when adding new product to the cart with free product already applied (via coupon)', () => {
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

  it('after adding unit type coupon with unit value 2 it should create `removeCustomLineItem` and `addCustomLineItem` actions', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(result.actions).toEqual([
      {
        action: 'setCustomType',
        type: { id: '5aa76235-9d61-41c7-9d57-278b2bcc2f75' },
        name: 'couponCodes',
      },
      {
        action: 'removeCustomLineItem',
        customLineItemId: '2a3c6424-41cb-4215-801b-8eaa903cdc3c',
      },
      {
        action: 'addCustomLineItem',
        name: { en: 'Coupon codes discount', de: 'Gutscheincodes rabatt' },
        quantity: 1,
        money: {
          centAmount: -84986,
          type: 'centPrecision',
          currencyCode: 'EUR',
        },
        slug: 'Voucher, ',
        taxCategory: { id: '64a3b50d-245c-465a-bb5e-faf59d729031' },
      },
      {
        action: 'changeLineItemQuantity',
        lineItemId: '324f6e75-62ba-4faa-aced-d63f21f997e2',
        quantity: 3,
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: 'cfb24766-4ca4-4cfe-89b6-9a067e7bba01',
        type: { key: 'lineItemCodesType' },
        fields: {},
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: '324f6e75-62ba-4faa-aced-d63f21f997e2',
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
        value: 'ssn_tJX9mCXxhHRl2HBp5IfMS2yiKQ3DHtlm',
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
