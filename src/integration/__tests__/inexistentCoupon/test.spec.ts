import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../../../commercetools/tax-categories/__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../../commercetools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../../voucherify/__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithResponse } from '../../../commercetools/__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';

import { CommercetoolsService } from '../../../commercetools/commercetools.service';
import { ProductMapper } from '../../mappers/product';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
describe('When trying to apply inexistent coupon code', () => {
  let commercetoolsService: CommercetoolsService;
  let productMapper: ProductMapper;
  let voucherifyConnectorService: VoucherifyConnectorService;

  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithResponse();

    ({ commercetoolsService, productMapper } =
      await buildCartServiceWithMockedDependencies({
        typesService,
        taxCategoriesService,
        voucherifyConnectorService,
        commerceToolsConnectorService,
      }));
  });

  it('Should call voucherify exactly once', async () => {
    await commercetoolsService.validatePromotionsAndBuildCartActions(cart);

    expect(
      voucherifyConnectorService.validateStackableVouchers,
    ).toBeCalledTimes(1);
    expect(voucherifyConnectorService.validateStackableVouchers).toBeCalledWith(
      {
        customer: { source_id: undefined },
        order: {
          amount: 26500,
          customer: { source_id: undefined },
          discount_amount: 0,
          items: [
            {
              amount: 26500,
              price: 26500,
              product: { name: 'Some product', override: true },
              quantity: 1,
              related_object: 'sku',
              sku: { metadata: {}, override: true, sku: 'Some product' },
              source_id: 'product-sku1',
            },
          ],
          source_id: 'cart-id',
        },
        redeemables: [{ id: 'NOT EXIST', object: 'voucher' }],
        session: { type: 'LOCK' },
      },
    );
  });

  it('Should return only one `setCustomField` action with information about failure', async () => {
    const result =
      await commercetoolsService.validatePromotionsAndBuildCartActions(cart);

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
        availablePromotions: [],
        applicableCoupons: [],
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
        newSessionKey: 'ssn_HFTS1dgkRTrJikmCfKAUbDEmGrXpScuw',
        valid: false,
        totalDiscountAmount: 0,
        productsToAdd: [],
        onlyNewCouponsFailed: true,
        allInapplicableCouponsArePromotionTier: false,
        couponsLimit: 5,
      },
    });
  });
});
