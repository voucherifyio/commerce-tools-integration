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
        discount_amount: 2000,
        total_discount_amount: 2000,
        initial_amount: 26500,
        applied_discount_amount: 2000,
        total_applied_discount_amount: 2000,
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
    discount_amount: 2000,
    total_discount_amount: 2000,
    initial_amount: 26500,
    applied_discount_amount: 2000,
    total_applied_discount_amount: 2000,
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
  session: { key: 'new-session-id', type: 'LOCK', ttl: 7, ttl_unit: 'DAYS' },
};
describe('When one -20€ amount voucher is provided in new session', () => {
  let cart;
  let cartService: CartService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const COUPON_CODE = 'AMOUNT20';
  const SESSION_KEY = 'new-session-id';

  beforeEach(async () => {
    cart = defaultCart();
    cart.version = 2;
    setupCouponCodes(cart, {
      code: COUPON_CODE,
      status: 'NEW',
    } as Coupon);

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

  it('Should call voucherify exactly once', async () => {
    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledTimes(1);
    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledWith(
      [
        {
          code: 'AMOUNT20',
          status: 'NEW',
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      null,
    );
  });

  it('Should assign new session with voucherify and store in cart', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'setCustomField',
          name: 'session',
          value: SESSION_KEY,
        }),
      ]),
    );
  });

  it('Should create "addCustomLineItem" action with coupons total value', async () => {
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
            centAmount: -2000,
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
  });
  it('Should create "setCustomField" action with validated coupons', async () => {
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
              value: 2000,
            }),
          ],
        }),
      ]),
    );
  });
});
