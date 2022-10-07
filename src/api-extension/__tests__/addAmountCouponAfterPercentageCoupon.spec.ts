import { defaultCart, setupCouponCodes } from './cart.mock';
import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';
import { Coupon } from '../coupon';
import { CartService } from '../cart.service';
import { ProductMapper } from '../mappers/product';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';

const voucherifyResponse = {
  valid: true,
  redeemables: [
    {
      order: {
        id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
        source_id: 'cart-id',
        created_at: '2022-07-07T11:26:37.521Z',
        amount: 26500,
        discount_amount: 2650,
        total_discount_amount: 2650,
        initial_amount: 26500,
        applied_discount_amount: 2650,
        total_applied_discount_amount: 2650,
        items: [
          {
            sku_id: 'product-sku1',
            product_id: 'product-id',
            related_object: 'product',
            quantity: 1,
            price: 26500,
            amount: 26500,
            object: 'order_item',
          },
        ],
        metadata: {},
        object: 'order',
        items_discount_amount: 0,
        items_applied_discount_amount: 0,
      },
      applicable_to: { data: [], total: 0, object: 'list' },
      inapplicable_to: { data: [], total: 0, object: 'list' },
      metadata: {},
      id: 'PERC10',
      status: 'APPLICABLE',
      object: 'voucher',
      result: {
        discount: {
          type: 'PERCENT',
          effect: 'APPLY_TO_ORDER',
          percent_off: 10,
        },
      },
    },
    {
      order: {
        id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
        source_id: 'cart-id',
        created_at: '2022-07-07T11:26:37.521Z',
        amount: 26500,
        discount_amount: 4650,
        total_discount_amount: 4650,
        initial_amount: 26500,
        applied_discount_amount: 2000,
        total_applied_discount_amount: 4650,
        items: [
          {
            sku_id: 'product-sku1',
            product_id: 'product-id',
            related_object: 'product',
            quantity: 1,
            price: 26500,
            amount: 26500,
            object: 'order_item',
          },
        ],
        metadata: {},
        object: 'order',
        items_discount_amount: 0,
        items_applied_discount_amount: 0,
      },
      applicable_to: { data: [], total: 0, object: 'list' },
      inapplicable_to: { data: [], total: 0, object: 'list' },
      metadata: {},
      id: 'AMOUNT20',
      status: 'APPLICABLE',
      object: 'voucher',
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ORDER',
          amount_off: 2000,
        },
      },
    },
  ],
  order: {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'cart-id',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 26500,
    discount_amount: 4650,
    total_discount_amount: 4650,
    initial_amount: 26500,
    applied_discount_amount: 4650,
    total_applied_discount_amount: 4650,
    items: [
      {
        sku_id: 'product-sku1',
        product_id: 'product-id',
        related_object: 'product',
        quantity: 1,
        price: 26500,
        amount: 26500,
        object: 'order_item',
      },
    ],
    metadata: {},
    object: 'order',
    items_discount_amount: 0,
    items_applied_discount_amount: 0,
  },
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: {
    key: 'existing-session-id',
    type: 'LOCK',
    ttl: 7,
    ttl_unit: 'DAYS',
  },
};

describe('When another -20€ amount voucher is provided after -10% coupon in one session', () => {
  let cart;
  let cartService: CartService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const FIRST_COUPON_CODE = 'PERC10';
  const SECOND_COUPON_CODE = 'AMOUNT20';
  const SESSION_KEY = 'existing-session-id';

  beforeEach(async () => {
    cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(
      cart,
      {
        code: FIRST_COUPON_CODE,
        status: 'APPLIED',
        value: 2650,
      } as Coupon,
      {
        code: SECOND_COUPON_CODE,
        status: 'NEW',
      } as Coupon,
    );
    cart.custom.fields.session = SESSION_KEY;

    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    ({ cartService, productMapper } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
        commerceToolsConnectorService,
      }));
  });

  it('Should call voucherify once', async () => {
    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledTimes(1);
    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledWith(
      [
        {
          code: 'PERC10',
          status: 'APPLIED',
          value: 2650,
        },
        {
          code: 'AMOUNT20',
          status: 'NEW',
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      SESSION_KEY,
    );
  });
  it('Should create one `addCustomLineItem` action with all coupons value combined', async () => {
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
            centAmount: -4650,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: `Voucher, `,
          taxCategory: {
            id: defaultGetCouponTaxCategoryResponse.id,
          },
        }),
      ]),
    );
  });

  it('Should create one `setCustomField` action with all coupons applied', async () => {
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
              code: FIRST_COUPON_CODE,
              status: 'APPLIED',
              type: 'voucher',
              value: 2650,
            }),
            JSON.stringify({
              code: SECOND_COUPON_CODE,
              status: 'APPLIED',
              type: 'voucher',
              value: 2000,
            }),
          ],
        }),
      ]),
    );
  });
});
