import {
  CartOrigin,
  CartState,
  CustomFields,
  LineItem,
  RoundingMode,
  TaxCalculationMode,
  TaxMode,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { Test, TestingModule } from '@nestjs/testing';
import { CartAction, CartService } from '../cart.service';
import { TaxCategoriesService } from '../../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../../commerceTools/types/types.service';
import {
  defaultTypeId,
  MockedTypesService,
} from '../../commerceTools/types/__mocks__/types.service';
import { VoucherifyConnectorService } from '../../voucherify/voucherify-connector.service';
import {
  defaultGetCouponTaxCategoryResponse,
  MockedTaxCategoriesService,
} from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { MockedVoucherifyConnectorService } from '../../voucherify/__mocks__/voucherify-connector.service';
import { Coupon } from '../coupon';

jest.mock('../../commerceTools/tax-categories/tax-categories.service');
jest.mock('../../commerceTools/types/types.service');
jest.mock('../../voucherify/voucherify-connector.service');

function buildPriceValue(value, currency = 'EUR'): TypedMoney {
  return {
    type: 'centPrecision',
    currencyCode: currency,
    centAmount: value,
    fractionDigits: 2,
  };
}

const defaultLineItem = () =>
  ({
    id: 'line-item-id',
    productId: 'product-id',
    name: {
      en: 'Some product',
    },
    productType: {
      typeId: 'product-type',
      id: 'product-type-id',
    },
    productSlug: {
      en: 'some-product-slug',
    },
    variant: {
      id: 1,
      sku: 'product-sku1',
      key: 'product-key1',
      prices: [
        {
          id: 'product-prices-1-id',
          value: buildPriceValue(26500, 'EUR'),
        },
      ],
    },
    price: {
      id: 'product-prices-1-id',
      value: buildPriceValue(26500, 'EUR'),
      country: 'DE',
    },
    quantity: 1,
    discountedPricePerQuantity: [],
    taxRate: {
      name: '19% incl.',
      amount: 0.19,
      includedInPrice: true,
      country: 'DE',
      id: 'tax-DE',
    },
    state: [
      {
        quantity: 1,
        state: {
          typeId: 'state',
          id: 'state-type-id',
        },
      },
    ],
    priceMode: 'Platform',
    totalPrice: buildPriceValue(26500, 'EUR'),
    taxedPrice: {
      totalNet: buildPriceValue(22269, 'EUR'),
      totalGross: buildPriceValue(26500, 'EUR'),
      totalTax: buildPriceValue(4231, 'EUR'),
    },
    lineItemMode: 'Standard',
  } as LineItem);

const defaultCart = () => ({
  id: 'cart-id',
  type: 'Cart',
  createdAt: new Date().toISOString(),
  version: 1,
  lastModifiedAt: new Date().toISOString(),
  country: 'DE',
  lineItems: [defaultLineItem()],
  customLineItems: [],
  totalPrice: buildPriceValue(26500, 'EUR'),
  cartState: 'Active' as CartState,
  taxMode: <TaxMode>{},
  taxRoundingMode: <RoundingMode>{},
  taxCalculationMode: <TaxCalculationMode>{},
  refusedGifts: [],
  origin: <CartOrigin>{},
  custom: <CustomFields>{},
});

const setupCouponCodes = (cart, ...coupons: Coupon[]) => {
  cart.custom = {
    type: {
      typeId: 'type',
      id: defaultTypeId,
    },
    fields: {
      discount_codes: coupons.map((coupon) => JSON.stringify(coupon)),
    },
  };
};

const byActionType = (actionName: string) => (action: CartAction) =>
  action.action === actionName;
const byCustomField = (fieldName: string) => (action: CartAction) =>
  action.action === 'setCustomField' && action.name === fieldName;

describe('CartService', () => {
  let cartService: CartService;
  let taxCategoriesService: MockedTaxCategoriesService;
  let typesService: MockedTypesService;
  let voucherifyConnectorService: MockedVoucherifyConnectorService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: TaxCategoriesService,
          useValue: TaxCategoriesService,
        },
        {
          provide: TypesService,
          useValue: TypesService,
        },
        {
          provide: VoucherifyConnectorService,
          useValue: VoucherifyConnectorService,
        },
      ],
    }).compile();

    cartService = app.get<CartService>(CartService);
    taxCategoriesService = app.get<TaxCategoriesService>(
      TaxCategoriesService,
    ) as MockedTaxCategoriesService;
    typesService = app.get<TypesService>(TypesService) as MockedTypesService;
    voucherifyConnectorService = app.get<VoucherifyConnectorService>(
      VoucherifyConnectorService,
    ) as MockedVoucherifyConnectorService;
  });

  beforeEach(() => {
    taxCategoriesService.__simulateDefaultGetCouponTaxCategories();
    typesService.__simulateDefaultFindCouponType();
    voucherifyConnectorService.__simulateDefaultValidateStackable();
  });

  describe('checkCartAndMutate', () => {
    it('should add custom coupon type for initialized cart', async () => {
      const cart = defaultCart();

      const result = await cartService.checkCartAndMutate(cart);

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
      typesService.__simulateCouponTypeIsNotDefined();

      expect(cartService.checkCartAndMutate(cart)).rejects.toThrowError(
        new Error('CouponType not found'),
      );
    });

    describe('tax categories', () => {
      it('should throw error if tax categories are not configured', async () => {
        const cart = defaultCart();
        cart.version = 2;
        taxCategoriesService.__simulateCouponTaxCategoryIsNotDefined();

        expect(cartService.checkCartAndMutate(cart)).rejects.toThrowError(
          new Error('Coupon tax category was not configured correctly'),
        );
      });

      it('should add new country to coupon tax category if not exist', async () => {
        const cart = defaultCart();
        cart.version = 2;
        cart.country = 'CH';

        await cartService.checkCartAndMutate(cart);

        expect(taxCategoriesService.getCouponTaxCategory).toBeCalledTimes(1);
        expect(
          taxCategoriesService.addCountryToCouponTaxCategory,
        ).toBeCalledTimes(1);
        expect(
          taxCategoriesService.addCountryToCouponTaxCategory,
        ).toBeCalledWith(defaultGetCouponTaxCategoryResponse, 'CH');
      });

      it('should work with one of returned tax categories for countries which already exist', async () => {
        const cart = defaultCart();
        cart.version = 2;

        await cartService.checkCartAndMutate(cart);

        expect(taxCategoriesService.getCouponTaxCategory).toBeCalledTimes(1);
        expect(
          taxCategoriesService.addCountryToCouponTaxCategory,
        ).not.toBeCalled();
      });
    });

    describe('when no coupon codes provided and have no previous voucherify session,', () => {
      let cart;

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 2;
        setupCouponCodes(cart);
      });

      it('should create "setCustomField" action with empty value', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        expect(result.actions).toEqual([
          {
            action: 'setCustomField',
            name: 'discount_codes',
            value: [],
          },
        ]);
      });

      it('should NOT call voucherify', async () => {
        await cartService.checkCartAndMutate(cart);

        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).not.toBeCalled();
      });

      it('should create "removeCustomLineItem" action if had customLineItems previously', async () => {
        cart.customLineItems = [
          {
            id: 'custom-line-item-1',
            name: {
              en: 'Voucher, coupon value => 20.00',
            },
            quantity: 1,
            money: buildPriceValue(2000, 'EUR'),
            slug: 'voucher-20',
            taxCategory: {
              id: defaultGetCouponTaxCategoryResponse.id,
            },
          },
        ];

        const result = await cartService.checkCartAndMutate(cart);

        expect(result.actions.length).toBeGreaterThanOrEqual(2);
        const removeCustomLineItemAction = result.actions.find(
          byActionType('removeCustomLineItem'),
        );
        expect(removeCustomLineItemAction).toEqual({
          action: 'removeCustomLineItem',
          customLineItemId: 'custom-line-item-1',
        });
      });

      it('should NOT create "removeCustomLineItem" action when cart contains unknown custom lines', async () => {
        cart.customLineItems = [
          {
            id: 'custom-unknown-line-item-1',
            name: {
              en: 'Custom unknown line',
            },
            quantity: 1,
            money: buildPriceValue(10000, 'EUR'),
            slug: 'custom-unknown-line-item',
          },
        ];

        const result = await cartService.checkCartAndMutate(cart);

        const removeCustomLineItemActions = result.actions.filter(
          byActionType('removeCustomLineItem'),
        );
        expect(removeCustomLineItemActions.length).toBe(0);
      });
    });

    describe('when one -20€ amount voucher is provided in new session', () => {
      let cart;
      const COUPON_CODE = 'AMOUNT20';
      const SESSION_KEY = 'new-session-id';

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 2;
        setupCouponCodes(cart, {
          code: COUPON_CODE,
          status: 'NEW',
        } as Coupon);

        voucherifyConnectorService
          .__simulateDefaultValidateStackable()
          .__useCartAsOrderReference(cart)
          .__addDiscountCoupon(COUPON_CODE, 2000)
          .__useSessionKey(SESSION_KEY);
      });

      it('should call voucherify exactly once', async () => {
        await cartService.checkCartAndMutate(cart);

        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledTimes(1);
        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledWith([COUPON_CODE], cart, null);
      });

      it('should assign new session with voucherify and store in cart', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setSessionCustomFieldAction = result.actions.find(
          byCustomField('session'),
        );
        expect(setSessionCustomFieldAction).toEqual({
          action: 'setCustomField',
          name: 'session',
          value: SESSION_KEY,
        });
      });

      it('should create "addCustomLineItem" action with coupons total value', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const addCustomLineItemActions = result.actions.filter(
          byActionType('addCustomLineItem'),
        );
        expect(addCustomLineItemActions.length).toBe(1);
        expect(addCustomLineItemActions[0]).toEqual({
          action: 'addCustomLineItem',
          name: {
            en: 'Voucher, coupon value => 20.00',
          },
          quantity: 1,
          money: {
            centAmount: -2000,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: COUPON_CODE,
          taxCategory: {
            id: defaultGetCouponTaxCategoryResponse.id,
          },
        });
      });

      it('should create "setCustomField" action with validated coupons', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setDiscountCodesAction = result.actions.find(
          byCustomField('discount_codes'),
        );
        expect(setDiscountCodesAction).toEqual({
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            JSON.stringify({
              code: COUPON_CODE,
              status: 'APPLIED',
              value: 2000,
            }),
          ],
        });
      });
    });
  });
});
