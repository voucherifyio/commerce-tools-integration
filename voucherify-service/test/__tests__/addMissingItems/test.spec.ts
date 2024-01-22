import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../../__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../__mocks__/voucherify-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../../__mocks__/commerce-tools-connector.service';
import { buildCartServiceWithMockedDependencies } from '../cart-service.factory';
import { voucherifyResponse } from './snapshots/voucherifyResponse.snapshot';
import { cart } from './snapshots/cart.snapshot';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';
describe('when applying coupon code for a free product with `ADD_MISSING_ITEMS` effect and having that product already in cart', () => {
  let commercetoolsService: CommercetoolsService;
  let voucherifyConnectorService: VoucherifyConnectorService;
  const COUPON_CODE = 'ADD_GIFT';
  const SKU_ID = 'gift-sku-id';
  const PRODUCT_ID = '7c66ebdb-446d-4ea5-846e-80463a356ef2';
  const PRODUCT_PRICE = 6500;
  const lineItemId = 'line-item-id-10';

  beforeEach(async () => {
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

    ({ commercetoolsService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
      commerceToolsConnectorService,
    }));
  });
  it('should call voucherify once', async () => {
    await commercetoolsService.handleCartUpdate(cart);
    expect(
      voucherifyConnectorService.validateStackableVouchers,
    ).toBeCalledTimes(2);
    expect(voucherifyConnectorService.validateStackableVouchers).toBeCalledWith(
      {
        customer: { source_id: undefined },
        order: {
          amount: 33000,
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
            {
              amount: 6500,
              price: 6500,
              product: { name: 'Free product', override: true },
              quantity: 1,
              related_object: 'sku',
              sku: { metadata: {}, override: true, sku: 'Free product' },
              source_id: 'gift-sku-id',
            },
          ],
          source_id: 'cart-id',
        },
        redeemables: [{ id: 'ADD_GIFT', object: 'voucher' }],
        session: { key: 'existing-session-id', type: 'LOCK' },
      },
    );
  });

  it('should create one `addCustomLineItem` with applied coupon summary', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(
      result.actions.filter((e) => e.action === 'addCustomLineItem'),
    ).toHaveLength(1);

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
            centAmount: -PRODUCT_PRICE,
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

  it('should create one `changeLineItemQuantity` action with the id of the discounted product', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(
      result.actions.filter((e) => e.action === 'changeLineItemQuantity'),
    ).toHaveLength(1);

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'changeLineItemQuantity',
          lineItemId,
          quantity: 1,
        }),
      ]),
    );
  });

  it("should create one `setLineItemCustomType` action to apply items' applied_codes and one `setLineItemCustomType` to one remaining line item in cart to remove all custom-types from it", async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(
      result.actions.filter((e) => e.action === 'setLineItemCustomType'),
    ).toHaveLength(2);

    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'setLineItemCustomType',
          lineItemId,
          type: {
            key: 'lineItemCodesType',
          },
          fields: {
            applied_codes: [
              JSON.stringify({
                code: COUPON_CODE,
                type: 'UNIT',
                effect: 'ADD_MISSING_ITEMS',
                quantity: 1,
                totalDiscountQuantity: 1,
              }),
            ],
          },
        }),
      ]),
    );
  });

  it('should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
    const result = await commercetoolsService.handleCartUpdate(cart);

    expect(
      result.actions.filter((e) => e.action === 'setCustomField'),
    ).toHaveLength(3);

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
              value: PRODUCT_PRICE,
            }),
          ],
        }),
      ]),
    );
  });
});
