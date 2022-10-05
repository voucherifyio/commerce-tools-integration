import {
  defaultCart,
  defaultTypeId,
  setupCouponCodes,
  buildPriceValue,
  lineItemCounter,
} from './cart.mock';
import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import {
  getTypesServiceMockWithConfiguredCouponTypeResponse,
  getTypesServiceMockWithNotDefinedCouponTypeResponse,
} from '../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';

describe('when no coupon codes provided and have no previous voucherify session,', () => {
  it('should create "setCustomField" action with empty values and "setLineItemCustomType" with no fields for each lineItem', async () => {
    const cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(cart);

    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse();
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
        lineItemId: `line-item-id-${lineItemCounter}`,
        type: {
          key: 'lineItemCodesType',
        },
      },
    ]);
  });
  it('should NOT call voucherify', async () => {
    const cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(cart);

    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse();
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
  it('should create "removeCustomLineItem" action if had customLineItems previously', async () => {
    const cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(cart);
    cart.customLineItems = [
      {
        id: 'custom-line-item-1',
        name: {
          de: 'Gutscheincodes rabatt',
          en: 'Coupon codes discount',
        },
        quantity: 1,
        money: buildPriceValue(2000, 'EUR'),
        slug: 'Voucher, ',
        taxCategory: {
          id: defaultGetCouponTaxCategoryResponse.id,
        },
      },
    ];
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse();
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
  it('should NOT create "removeCustomLineItem" action when cart contains unknown custom lines', async () => {
    const cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(cart);
    cart.customLineItems = [
      {
        id: 'custom-unknown-line-item-1',
        name: {
          en: 'Custom unknown line',
        },
        quantity: 1,
        money: buildPriceValue(10000, 'EUR'),
        slug: 'custom-unknown-line-item',
      },
    ];

    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse();
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
    expect(result.actions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          action: 'removeCustomLineItem',
        }),
      ]),
    );
  });
});
