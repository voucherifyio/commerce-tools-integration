import {
  defaultCart,
  setupCouponCodes,
  buildPriceValue,
  lineItemCounter,
} from './cart.mock';
import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';
const voucherifyResponse = {
  valid: true,
  redeemables: [
    {
      status: 'APPLICABLE',
      id: 'HELLO_WORLD!',
      object: 'voucher',
      order: {
        id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
        source_id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
        created_at: '2022-07-07T11:26:37.521Z',
        amount: 29200,
        discount_amount: 2500,
        total_discount_amount: 2500,
        initial_amount: 29200,
        applied_discount_amount: 2500,
        total_applied_discount_amount: 2500,
        items: [
          {
            object: 'order_item',
            source_id: 'M0E20000000E1AZ',
            related_object: 'sku',
            product_id: 'prod_0b5672a19f4147f017',
            quantity: 1,
            amount: 12000,
            price: 12000,
            subtotal_amount: 12000,
            product: {
              id: 'prod_0b5672a19f4147f017',
              source_id: '9050a5d2-8f14-4e01-bcdc-c100dd1b441f',
              name: 'Sneakers New Balance multi',
              override: true,
            },
            sku: {
              id: 'sku_0b56734248814789a5',
              source_id: 'M0E20000000E1AZ',
              sku: 'Sneakers New Balance multi',
              price: 12000,
              override: true,
            },
          },
        ],
        metadata: {},
        object: 'order',
      },
      applicable_to: { data: [], total: 0, data_ref: 'data', object: 'list' },
      inapplicable_to: { data: [], total: 0, data_ref: 'data', object: 'list' },
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ORDER',
          amount_off: 2500,
        },
      },
    },
  ],
  order: {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 29200,
    discount_amount: 2500,
    total_discount_amount: 2500,
    initial_amount: 29200,
    applied_discount_amount: 2500,
    total_applied_discount_amount: 2500,
    items: [
      {
        object: 'order_item',
        source_id: 'M0E20000000E1AZ',
        related_object: 'sku',
        product_id: 'prod_0b5672a19f4147f017',
        quantity: 1,
        amount: 12000,
        price: 12000,
        subtotal_amount: 12000,
        product: {
          id: 'prod_0b5672a19f4147f017',
          source_id: '9050a5d2-8f14-4e01-bcdc-c100dd1b441f',
          name: 'Sneakers New Balance multi',
          override: true,
        },
        sku: {
          id: 'sku_0b56734248814789a5',
          source_id: 'M0E20000000E1AZ',
          sku: 'Sneakers New Balance multi',
          price: 12000,
          override: true,
        },
      },
    ],
    metadata: {},
    object: 'order',
  },
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: {
    key: 'ssn_HFTS1dgkRTrJikmCfKAUbDEmGrXpScuw',
    type: 'LOCK',
    ttl: 7,
    ttl_unit: 'DAYS',
  },
};
describe('When no coupon codes provided and have no previous voucherify session,', () => {
  it('should create "setCustomField" action with empty values and "setLineItemCustomType" with no fields for each lineItem', async () => {
    const cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(cart);

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
        lineItemId: `line-item-id-${lineItemCounter}`,
        type: {
          key: 'lineItemCodesType',
        },
      },
    ]);
  });
  it('Should NOT call voucherify', async () => {
    const cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(cart);

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
    expect(result.actions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          action: 'removeCustomLineItem',
        }),
      ]),
    );
  });
});
