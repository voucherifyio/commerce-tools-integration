import { defaultCart, setupCouponCodes } from './cart.mock';
import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../commerceTools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';
import { Coupon } from '../coupon';
import { CartService } from '../cart.service';
import { ProductMapper } from '../mappers/product';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';

const voucherifyResponse = {
  valid: false,
  redeemables: [
    {
      status: 'INAPPLICABLE',
      id: 'NOT EXIST',
      object: 'voucher',
      result: {
        error: {
          code: 404,
          key: 'not_found',
          message: 'Resource not found',
          details: 'Cannot find voucher with id NOT EXIST',
          request_id: 'v-123123123123',
        },
      },
    },
  ],
  order: {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 29200,
    discount_amount: 0,
    total_discount_amount: 0,
    initial_amount: 29200,
    applied_discount_amount: 0,
    total_applied_discount_amount: 0,
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
    items_discount_amount: 0,
    items_applied_discount_amount: 0,
  },
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: {
    key: 'ssn_HFTS1dgkRTrJikmCfKAUbDEmGrXpScuw',
    type: 'LOCK',
    ttl: 7,
    ttl_unit: 'DAYS',
  },
};
describe('When trying to apply inexistent coupon code', () => {
  let cart;
  let cartService: CartService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const COUPON_CODE = 'NOT EXIST';

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
          code: 'NOT EXIST',
          status: 'NEW',
        },
      ],
      cart,
      productMapper.mapLineItems(cart.lineItems),
      null,
    );
  });

  it('Should return only one `setCustomField` action with information about failure', async () => {
    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );
    expect(result).toEqual({
      status: true,
      actions: [
        {
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            '{"code":"NOT EXIST","status":"NOT_APPLIED","errMsg":"Resource not found"}',
          ],
        },
      ],
      validateCouponsResult: {
        allInapplicableCouponsArePromotionTier: false,
        availablePromotions: [],
        applicableCoupons: [],
        couponsLimit: 5,
        newSessionKey: 'ssn_HFTS1dgkRTrJikmCfKAUbDEmGrXpScuw',
        notApplicableCoupons: [
          {
            status: 'INAPPLICABLE',
            id: 'NOT EXIST',
            object: 'voucher',
            result: {
              error: {
                code: 404,
                key: 'not_found',
                message: 'Resource not found',
                details: 'Cannot find voucher with id NOT EXIST',
                request_id: 'v-123123123123',
              },
            },
          },
        ],
        skippedCoupons: [],
        valid: false,
        totalDiscountAmount: 0,
        productsToAdd: [],
        onlyNewCouponsFailed: true,
        taxCategory: {
          id: '64a3b50d-245c-465a-bb5e-faf59d729031',
          version: 30,
          createdAt: '2022-07-06T10:31:15.807Z',
          lastModifiedAt: '2022-07-06T10:31:46.488Z',
          lastModifiedBy: {
            clientId: 'S7ikAUxscunVOCl_qQ1uUzLP',
            isPlatformClient: false,
          },
          createdBy: {
            clientId: 'S7ikAUxscunVOCl_qQ1uUzLP',
            isPlatformClient: false,
          },
          name: 'coupon',
          rates: [
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'US',
              id: 'sometaxUS',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'DE',
              id: 'sometaxDE',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'IT',
              id: 'sometaxIT',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'GB',
              id: 'sometaxGB',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'BE',
              id: 'sometaxBE',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'BG',
              id: 'sometaxBG',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'DK',
              id: 'sometaxDK',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'EE',
              id: 'sometaxEE',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'FI',
              id: 'sometaxFI',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'FR',
              id: 'sometaxFR',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'GR',
              id: 'sometaxGR',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'IE',
              id: 'sometaxIE',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'HR',
              id: 'sometaxHR',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'LV',
              id: 'sometaxLV',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'LT',
              id: 'sometaxLT',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'LU',
              id: 'sometaxLU',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'MT',
              id: 'sometaxMT',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'NL',
              id: 'sometaxNL',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'AT',
              id: 'sometaxAT',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'PL',
              id: 'sometaxPL',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'PT',
              id: 'sometaxPT',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'RO',
              id: 'sometaxRO',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'SE',
              id: 'sometaxSE',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'SK',
              id: 'sometaxSK',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'SI',
              id: 'sometaxSI',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'ES',
              id: 'sometaxES',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'CZ',
              id: 'sometaxCZ',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'HU',
              id: 'sometaxHU',
              subRates: [],
            },
            {
              name: 'coupon',
              amount: 0,
              includedInPrice: true,
              country: 'CY',
              id: 'sometaxCY',
              subRates: [],
            },
          ],
        },
      },
    });
  });
});
