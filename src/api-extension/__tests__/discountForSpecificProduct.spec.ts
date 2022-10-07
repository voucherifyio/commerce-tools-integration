import {
  defaultCart,
  defaultTypeId,
  setupCouponCodes,
  buildPriceValue,
  lineItemCounter,
  doubleFirstLineItem,
  createLineItem,
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
import {
  getVoucherifyConnectorServiceMockWithDefinedResponse,
  useCartAsOrderReferenceModifier,
  addDiscountCoupon,
  useSessionKey,
  simulateInvalidValidation,
  withInapplicableCoupon,
  addPercentageRateCoupon,
  withInexistentCoupon,
  addProductDiscount,
} from '../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';
import { Coupon } from '../coupon';
import { CartService } from '../cart.service';
import { ProductMapper } from '../mappers/product';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { response } from 'express';
import exp from 'constants';

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
      getVoucherifyConnectorServiceMockWithDefinedResponse([
        useCartAsOrderReferenceModifier(cart),
        addProductDiscount(COUPON_CODE, PRODUCT_ID, 3000),
        useSessionKey(SESSION_KEY),
      ]);
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
