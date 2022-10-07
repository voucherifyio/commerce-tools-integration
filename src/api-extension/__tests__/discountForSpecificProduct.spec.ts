import {
  defaultCart,
  setupCouponCodes,
  buildPriceValue,
  createLineItem,
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
        amount: 20000,
        discount_amount: 0,
        total_discount_amount: 3000,
        initial_amount: 20000,
        applied_discount_amount: 0,
        total_applied_discount_amount: 3000,
        items: [
          {
            sku_id: 'skudiscounted-sneakers',
            product_id: 'discounted-sneakers',
            related_object: 'product',
            quantity: 1,
            price: 20000,
            amount: 20000,
            object: 'order_item',
            discount_amount: 3000,
            applied_discount_amount: 3000,
            subtotal_amount: 17000,
          },
        ],
        metadata: {},
        object: 'order',
        items_discount_amount: 3000,
        items_applied_discount_amount: 3000,
      },
      applicable_to: {
        data: [
          {
            object: 'products_collection',
            id: 'pc_id',
            effect: 'APPLY_TO_EVERY',
            strict: false,
          },
          {
            object: 'sku',
            id: 'skudiscounted-sneakers',
            source_id: 'discounted-sneakers',
            strict: true,
            effect: 'APPLY_TO_EVERY',
          },
        ],
        total: 2,
        object: 'list',
      },
      inapplicable_to: { data: [], total: 0, object: 'list' },
      metadata: {},
      id: 'SNEAKERS30',
      status: 'APPLICABLE',
      object: 'voucher',
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ITEMS',
          amount_off: 3000,
        },
      },
    },
  ],
  order: {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'cart-id',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 20000,
    discount_amount: 3000,
    total_discount_amount: 3000,
    initial_amount: 20000,
    applied_discount_amount: 0,
    total_applied_discount_amount: 0,
    items: [
      {
        sku_id: 'skudiscounted-sneakers',
        product_id: 'discounted-sneakers',
        related_object: 'product',
        quantity: 1,
        price: 20000,
        amount: 20000,
        object: 'order_item',
        discount_amount: 3000,
        applied_discount_amount: 3000,
        subtotal_amount: 17000,
      },
    ],
    metadata: {},
    object: 'order',
    items_discount_amount: 3000,
    items_applied_discount_amount: 3000,
  },
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: {
    key: 'existing-session-id',
    type: 'LOCK',
    ttl: 7,
    ttl_unit: 'DAYS',
  },
};
describe('when applying discount code on a specific product in the cart', () => {
  let cart;
  let cartService: CartService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const COUPON_CODE = 'SNEAKERS30';
  const PRODUCT_ID = 'discounted-sneakers';
  const SESSION_KEY = 'existing-session-id';
  const PRICE = 20000;

  beforeEach(async () => {
    cart = defaultCart();
    cart.version = 2;
    cart.lineItems = [
      createLineItem({
        name: 'Sneakers',
        productId: PRODUCT_ID,
        sku: `sku${PRODUCT_ID}`,
        price: PRICE,
        netPrice: 16807,
        vatValue: 3193,
        quantity: 1,
      }),
    ];
    cart.totalPrice = buildPriceValue(PRICE, 'EUR');
    setupCouponCodes(cart, {
      status: 'NEW',
      code: COUPON_CODE,
    } as Coupon);
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
  it('call voucherify once', async () => {
    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledTimes(1);
    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledWith(
      [
        {
          code: 'SNEAKERS30',
          status: 'NEW',
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      SESSION_KEY,
    );
  });
  it('should create `addCustomLineItem` action with total coupons value applied', async () => {
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
            centAmount: 0,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: 'Voucher, ',
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

  it('should create three `setCustomField` with default values and action with storing coupon details to the cart', async () => {
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
              code: COUPON_CODE,
              status: 'APPLIED',
              type: 'voucher',
              value: 3000,
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
