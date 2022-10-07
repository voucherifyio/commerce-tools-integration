import { defaultCart, setupCouponCodes } from './cart.mock';
import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../commerceTools/__mocks__/commerce-tools-connector.service';
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
        discount_amount: 0,
        total_discount_amount: 6500,
        initial_amount: 26500,
        applied_discount_amount: 0,
        total_applied_discount_amount: 6500,
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
          {
            source_id: 'gift-sku-id',
            related_object: 'sku',
            product_id: 'gift-product-id',
            quantity: 1,
            discount_quantity: 1,
            initial_quantity: 1,
            amount: 6500,
            discount_amount: 6500,
            initial_amount: 6500,
            applied_discount_amount: 6500,
            price: 6500,
            subtotal_amount: 0,
            product: {
              id: 'product-id',
              source_id: 'gift-product-id',
              override: true,
            },
            sku: {
              id: 'sku-id',
              source_id: 'gift-sku-id',
              price: 6500,
              override: true,
            },
          },
        ],
        metadata: {},
        object: 'order',
        items_discount_amount: 6500,
        items_applied_discount_amount: 6500,
      },
      applicable_to: { data: [], total: 0, object: 'list' },
      inapplicable_to: { data: [], total: 0, object: 'list' },
      metadata: {},
      id: 'ADD_GIFT',
      status: 'APPLICABLE',
      object: 'voucher',
      result: {
        discount: {
          type: 'UNIT',
          effect: 'ADD_NEW_ITEMS',
          unit_off: 1,
          unit_type: 'gift-product-id',
          sku: { id: 'sku-id', source_id: 'gift-sku-id' },
          product: { id: 'product-id', source_id: 'gift-product-id' },
        },
      },
    },
  ],
  order: {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'cart-id',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 33000,
    discount_amount: 0,
    total_discount_amount: 6500,
    initial_amount: 26500,
    applied_discount_amount: 0,
    total_applied_discount_amount: 6500,
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
      {
        source_id: 'gift-sku-id',
        related_object: 'sku',
        product_id: 'gift-product-id',
        quantity: 1,
        discount_quantity: 1,
        initial_quantity: 1,
        amount: 6500,
        discount_amount: 6500,
        initial_amount: 6500,
        applied_discount_amount: 6500,
        price: 6500,
        subtotal_amount: 0,
        product: {
          id: 'product-id',
          source_id: 'gift-product-id',
          override: true,
        },
        sku: {
          id: 'sku-id',
          source_id: 'gift-sku-id',
          price: 6500,
          override: true,
        },
      },
    ],
    metadata: {},
    object: 'order',
    items_discount_amount: 6500,
    items_applied_discount_amount: 6500,
  },
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: {
    key: 'existing-session-id',
    type: 'LOCK',
    ttl: 7,
    ttl_unit: 'DAYS',
  },
};
describe('when applying discount code which adds free product to the cart', () => {
  let cart;
  let cartService: CartService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const COUPON_CODE = 'ADD_GIFT';
  const SKU_ID = 'gift-sku-id';
  const PRODUCT_ID = 'gift-product-id';
  const SESSION_KEY = 'existing-session-id';
  const PRODUCT_PRICE = 6500;

  beforeEach(async () => {
    cart = defaultCart();
    cart.version = 2;
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
      getCommerceToolsConnectorServiceMockWithProductResponse({
        sku: SKU_ID,
        price: PRODUCT_PRICE,
        id: PRODUCT_ID,
      });

    ({ cartService, productMapper } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
        commerceToolsConnectorService,
      }));
  });

  it('should call voucherify once', async () => {
    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledTimes(1);
    expect(
      voucherifyConnectorService.validateStackableVouchersWithCTCart,
    ).toBeCalledWith(
      [
        {
          code: 'ADD_GIFT',
          status: 'NEW',
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      SESSION_KEY,
    );
  });

  it('should create `addLineItem` action with gift product', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'addLineItem',
          sku: SKU_ID,
          quantity: 1,
          custom: {
            typeKey: 'lineItemCodesType',
            fields: {
              applied_codes: [
                JSON.stringify({
                  code: COUPON_CODE,
                  type: 'UNIT',
                  effect: 'ADD_NEW_ITEMS',
                  quantity: 1,
                  totalDiscountQuantity: 1,
                }),
              ],
            },
          },
        }),
      ]),
    );

    expect(
      result.actions.filter((e) => e.action === 'addLineItem'),
    ).toHaveLength(1);
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
            centAmount: -6500,
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

  it('should create three `setCustomField` for default customFields settings and action storing coupon details to the cart', async () => {
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
              value: 6500,
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
