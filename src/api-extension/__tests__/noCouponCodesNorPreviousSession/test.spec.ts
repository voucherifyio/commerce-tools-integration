import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { cart as cartWithUnknownCustomLineItem } from './snapshots/cart-with-unknown-custom-line-item.snapshot';
import { cart as cartWithCustomLineItem } from './snapshots/cart-with-custom-line-item.snapshot';
describe('When no coupon codes provided and have no previous voucherify session,', () => {
  it('should create "setCustomField" action with empty values and "setLineItemCustomType" with no fields for each lineItem', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    });

    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(result.actions).toEqual([
      {
        action: 'setCustomField',
        name: 'shippingProductSourceIds',
        value: [],
      },
      {
        action: 'setCustomField',
        name: 'couponsLimit',
        value: 5,
      },
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: [],
      },
      {
        action: 'setCustomField',
        name: 'isValidationFailed',
        value: false,
      },
      {
        action: 'setLineItemCustomType',
        fields: {},
        lineItemId: `line-item-id-1`,
        type: {
          key: 'lineItemCodesType',
        },
      },
    ]);
  });
  it('Should NOT call voucherify', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    });

    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).not.toBeCalled();
  });
  it('Should create "removeCustomLineItem" action if had customLineItems previously', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    });

    const result = await cartService.validatePromotionsAndBuildCartActions(
      cartWithCustomLineItem,
    );

    expect(result.actions.length).toBeGreaterThanOrEqual(2);
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'removeCustomLineItem',
          customLineItemId: 'custom-line-item-1',
        }),
      ]),
    );
  });
  it('Should NOT create "removeCustomLineItem" action when cart contains unknown custom lines', async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    });

    const result = await cartService.validatePromotionsAndBuildCartActions(
      cartWithUnknownCustomLineItem,
    );
    expect(result.actions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          action: 'removeCustomLineItem',
        }),
      ]),
    );
  });
});
