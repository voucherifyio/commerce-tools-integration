import {
  defaultCart,
  setupCouponCodes,
  doubleFirstLineItem,
} from './cart.mock';
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
        amount: 53000,
        discount_amount: 5300,
        total_discount_amount: 5300,
        initial_amount: 53000,
        applied_discount_amount: 5300,
        total_applied_discount_amount: 5300,
        items: [
          {
            sku_id: 'product-sku1',
            product_id: 'product-id',
            related_object: 'product',
            quantity: 2,
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
        amount: 53000,
        discount_amount: 7300,
        total_discount_amount: 7300,
        initial_amount: 53000,
        applied_discount_amount: 2000,
        total_applied_discount_amount: 7300,
        items: [
          {
            sku_id: 'product-sku1',
            product_id: 'product-id',
            related_object: 'product',
            quantity: 2,
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
    amount: 53000,
    discount_amount: 7300,
    total_discount_amount: 7300,
    initial_amount: 53000,
    applied_discount_amount: 7300,
    total_applied_discount_amount: 7300,
    items: [
      {
        sku_id: 'product-sku1',
        product_id: 'product-id',
        related_object: 'product',
        quantity: 2,
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
describe('When two discount codes (percentage and amount) are already applied and quantity of items have been updated', () => {
  let cart;
  let cartService: CartService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const FIRST_COUPON_CODE = 'PERC10';
  const SECOND_COUPON_CODE = 'AMOUNT20';
  const SESSION_KEY = 'existing-session-id';

  beforeEach(async () => {
    cart = defaultCart();
    cart.version = 20;
    doubleFirstLineItem(cart);
    setupCouponCodes(
      cart,
      {
        code: FIRST_COUPON_CODE,
        status: 'APPLIED',
        value: 2650,
      } as Coupon,
      {
        code: SECOND_COUPON_CODE,
        status: 'APPLIED',
        value: 2000,
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
  it('Should call voucherify to validate applied coupons again against updated cart', async () => {
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
          status: 'APPLIED',
          value: 2000,
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
            centAmount: -7300,
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

    expect(
      result.actions.filter((e) => e.action === 'addCustomLineItem'),
    ).toHaveLength(1);
  });

  it('Should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
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
              value: 5300,
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

    expect(
      result.actions.filter((e) => e.action === 'setCustomField'),
    ).toHaveLength(3);
  });
});
