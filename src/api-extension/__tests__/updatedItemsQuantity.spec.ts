import {
  defaultCart,
  defaultTypeId,
  setupCouponCodes,
  buildPriceValue,
  lineItemCounter,
  doubleFirstLineItem,
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
} from '../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';
import { Coupon } from '../coupon';
import { CartService } from '../cart.service';
import { ProductMapper } from '../mappers/product';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { response } from 'express';
import exp from 'constants';

describe('when another -20€ amount voucher is provided after -10% coupon in one session', () => {
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
      getVoucherifyConnectorServiceMockWithDefinedResponse([
        useCartAsOrderReferenceModifier(cart),
        addPercentageRateCoupon(FIRST_COUPON_CODE, 10),
        addDiscountCoupon(SECOND_COUPON_CODE, 2000),
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
  it('should call voucherify to validate applied coupons again against updated cart', async () => {
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

  it('should create one `addCustomLineItem` action with all coupons value combined', async () => {
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

  it('should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
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
