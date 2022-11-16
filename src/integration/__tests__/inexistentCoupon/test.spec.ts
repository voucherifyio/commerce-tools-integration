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
    await commercetoolsService.validateCouponsAndPromotionsAndBuildCartActionsOrSetCustomTypeForInitializedCart(
      cart,
    );

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
      await commercetoolsService.validateCouponsAndPromotionsAndBuildCartActionsOrSetCustomTypeForInitializedCart(
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
        validatedCoupons: {
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
          tracking_id:
            'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
          session: {
            key: 'ssn_HFTS1dgkRTrJikmCfKAUbDEmGrXpScuw',
            type: 'LOCK',
            ttl: 7,
            ttl_unit: 'DAYS',
          },
        },
        availablePromotions: [],
        productsToAdd: [],
      },
    });
  });
});
