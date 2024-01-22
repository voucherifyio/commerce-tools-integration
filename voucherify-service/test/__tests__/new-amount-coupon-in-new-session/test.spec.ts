import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithEmptyProductResponse } from '../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';
import { CommercetoolsConnectorService } from '../../../src/commercetools/commercetools-connector.service';
describe('When one -20€ amount voucher is provided in new session', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;
  let commerceToolsConnectorService: CommercetoolsConnectorService & {
    getProductMock: jest.Mock;
  };
  const COUPON_CODE = 'AMOUNT20';
  const SESSION_KEY = 'new-session-id';

  beforeEach(async () => {
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse(voucherifyResponse);
    commerceToolsConnectorService =
      getCommerceToolsConnectorServiceMockWithEmptyProductResponse();

    ({ commercetoolsService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    }));
  });

  it('Should call voucherify exactly once', async () => {
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
        redeemables: [{ id: 'AMOUNT20', object: 'voucher' }],
        session: { type: 'LOCK' },
      },
    );
  });

  it('Should assign new session with voucherify and store in cart', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

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

  it('Should not make a request to CT for a products', async () => {
    await commercetoolsService.handleCartUpdate(cart);
    expect(commerceToolsConnectorService.getProductMock).toBeCalledTimes(0);
  });

  it('Should create "setCustomField" action with validated coupons', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

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
