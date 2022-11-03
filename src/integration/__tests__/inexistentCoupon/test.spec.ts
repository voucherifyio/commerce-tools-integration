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
    console.log(111);
    const result =
      await commercetoolsService.validatePromotionsAndBuildCartActions(cart);

    console.log(result);
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
      },
    });
  });
});
