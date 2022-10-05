import { defaultCart, defaultTypeId } from './cart.mock';
import {
  getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse,
  getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse,
  defaultGetCouponTaxCategoryResponse,
} from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import {
  getTypesServiceMockWithConfiguredCouponTypeResponse,
  getTypesServiceMockWithNotDefinedCouponTypeResponse,
} from '../../commerceTools/types/__mocks__/types.service';
import { getVoucherifyConnectorServiceMockWithDefinedResponse } from '../../voucherify/__mocks__/voucherify-connector.service';
import { buildCartServiceWithMockedDependencies } from './cart-service.factory';

describe('cart custom types', () => {
  it('should add custom coupon type for initialized cart', async () => {
    const cart = defaultCart();
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
    });

    const result = await cartService.validatePromotionsAndBuildCartActions(
      cart,
    );

    expect(result).toEqual({
      status: true,
      actions: [
        {
          action: 'setCustomType',
          type: {
            id: defaultTypeId,
          },
          name: 'couponCodes',
        },
      ],
    });
    expect(typesService.findCouponType).toBeCalledTimes(1);
    expect(typesService.findCouponType).toBeCalledWith('couponCodes');
  });
  it('should throw error if "couponCodes" type is not found', async () => {
    const cart = defaultCart();
    const typesService = getTypesServiceMockWithNotDefinedCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
    });

    expect(
      cartService.validatePromotionsAndBuildCartActions(cart),
    ).rejects.toThrowError(new Error('CouponType not found'));
  });
});

describe('tax categories', () => {
  it('should throw error if tax categories are not configured', async () => {
    const cart = defaultCart();
    cart.version = 2;
    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
    });

    expect(
      cartService.validatePromotionsAndBuildCartActions(cart),
    ).rejects.toThrowError(
      new Error('Coupon tax category was not configured correctly'),
    );
  });
  it('should add new country to coupon tax category if not exist', async () => {
    const cart = defaultCart();
    cart.version = 2;
    cart.country = 'CH';

    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
    });

    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(taxCategoriesService.getCouponTaxCategory).toBeCalledTimes(1);
    expect(taxCategoriesService.addCountryToCouponTaxCategory).toBeCalledTimes(
      1,
    );
    expect(taxCategoriesService.addCountryToCouponTaxCategory).toBeCalledWith(
      defaultGetCouponTaxCategoryResponse,
      'CH',
    );
  });

  it('should work with one of returned tax categories for countries which already exist', async () => {
    const cart = defaultCart();
    cart.version = 2;

    const typesService = getTypesServiceMockWithConfiguredCouponTypeResponse();
    const taxCategoriesService =
      getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse();
    const voucherifyConnectorService =
      getVoucherifyConnectorServiceMockWithDefinedResponse();

    const { cartService } = await buildCartServiceWithMockedDependencies({
      typesService,
      taxCategoriesService,
      voucherifyConnectorService,
    });

    await cartService.validatePromotionsAndBuildCartActions(cart);

    expect(taxCategoriesService.getCouponTaxCategory).toBeCalledTimes(1);
    expect(taxCategoriesService.addCountryToCouponTaxCategory).not.toBeCalled();
  });
});
