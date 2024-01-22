import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithEmptyProductResponse } from '../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';
describe('When another -20€ amount voucher is provided after -10% coupon in one session', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const FIRST_COUPON_CODE = 'PERC10';
  const SECOND_COUPON_CODE = 'AMOUNT20';

  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    const commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithEmptyProductResponse();

    ({ commercetoolsService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    }));
  });

  it('Should call voucherify once', async () => {
    await commercetoolsService.handleCartUpdate(cart);
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
        redeemables: [
          { id: 'PERC10', object: 'voucher' },
          { id: 'AMOUNT20', object: 'voucher' },
        ],
        session: { key: 'existing-session-id', type: 'LOCK' },
      },
    );
  });

  it('Should create one `addCustomLineItem` action with all coupons value combined', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

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
            centAmount: -4650,
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
  });

  it('Should create one `setCustomField` action with all coupons applied', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

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
              value: 2650,
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
  });
});
