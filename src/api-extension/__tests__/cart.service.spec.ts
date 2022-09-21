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
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../cart.service';
import { TaxCategoriesService } from '../../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../../commerceTools/types/types.service';
import {
  defaultTypeId,
  MockedTypesService,
} from '../../commerceTools/types/__mocks__/types.service';
import { VoucherifyConnectorService } from '../../voucherify/voucherify-connector.service';
import { CommerceToolsConnectorService } from '../../commerceTools/commerce-tools-connector.service';
import {
  defaultGetCouponTaxCategoryResponse,
  MockedTaxCategoriesService,
} from '../../commerceTools/tax-categories/__mocks__/tax-categories.service';
import { MockedVoucherifyConnectorService } from '../../voucherify/__mocks__/voucherify-connector.service';
import { MockedCommerceToolsConectorService } from 'src/commerceTools/__mocks__/commerce-tools-connector.service';
import { Coupon } from '../coupon';
import { CartAction } from '../cartActions/CartAction';
import { ProductMapper } from '../mappers/product';
import { ConfigService } from '@nestjs/config';
import {
  NoOpRequestJsonLogger,
  REQUEST_JSON_LOGGER,
} from '../../misc/request-json-logger';
import path from 'path';
import mkdirp from 'mkdirp';
import { RequestJsonFileLogger } from '../../misc/request-json-file-logger';

jest.mock('../../commerceTools/tax-categories/tax-categories.service');
jest.mock('../../commerceTools/types/types.service');
jest.mock('../../voucherify/voucherify-connector.service');
jest.mock('../../commerceTools/commerce-tools-connector.service');

const DEFAULT_ITEM_PRICE = 26500;

function buildPriceValue(value, currency = 'EUR'): TypedMoney {
  return {
    type: 'centPrecision',
    currencyCode: currency,
    centAmount: value,
    fractionDigits: 2,
  };
}

interface CreateLineItemProps {
  productId?: string;
  name?: string;
  sku?: string;
  price?: number;
  netPrice?: number;
  vatValue?: number;
  quantity?: number;
}

let lineItemCounter = 0;

const createLineItem = (
  props: CreateLineItemProps = {
    productId: 'product-id',
    name: 'Some product',
    sku: 'product-sku1',
    price: DEFAULT_ITEM_PRICE,
    netPrice: 22269,
    vatValue: 4231,
    quantity: 1,
  },
) =>
  ({
    id: `line-item-id-${++lineItemCounter}`,
    productId: props.productId,
    name: {
      en: props.name,
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
      sku: props.sku,
      key: 'product-key1',
      prices: [
        {
          id: 'product-prices-1-id',
          value: buildPriceValue(props.price, 'EUR'),
        },
      ],
    },
    price: {
      id: 'product-prices-1-id',
      value: buildPriceValue(props.price, 'EUR'),
      country: 'DE',
    },
    quantity: props.quantity,
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
        quantity: props.quantity,
        state: {
          typeId: 'state',
          id: 'state-type-id',
        },
      },
    ],
    priceMode: 'Platform',
    totalPrice: buildPriceValue(props.price, 'EUR'),
    taxedPrice: {
      totalNet: buildPriceValue(props.netPrice, 'EUR'),
      totalGross: buildPriceValue(props.price, 'EUR'),
      totalTax: buildPriceValue(props.vatValue, 'EUR'),
    },
    lineItemMode: 'Standard',
  } as LineItem);

declare type itemAmountProvider = (item: LineItem) => number;

const doubleFirstLineItem = (cart) => {
  const item = cart.lineItems[0];
  item.quantity *= 2;
  item.state[0].quantity *= 2;
  item.totalPrice.centAmount *= 2;
  item.taxedPrice.totalNet.centAmount *= 2;
  item.taxedPrice.totalGross.centAmount *= 2;
  item.taxedPrice.totalTax.centAmount *= 2;

  const sum = (provider: itemAmountProvider) =>
    cart.lineItems.reduce(
      (total: number, item: LineItem) => total + provider(item),
      0,
    );
  cart.totalPrice.centAmount = sum((item) => item.totalPrice.centAmount);
};

const defaultCart = () => ({
  id: 'cart-id',
  type: 'Cart',
  createdAt: new Date().toISOString(),
  version: 1,
  lastModifiedAt: new Date().toISOString(),
  country: 'DE',
  lineItems: [createLineItem()],
  customLineItems: [],
  totalPrice: buildPriceValue(DEFAULT_ITEM_PRICE, 'EUR'),
  cartState: 'Active' as CartState,
  taxMode: <TaxMode>{},
  taxRoundingMode: <RoundingMode>{},
  taxCalculationMode: <TaxCalculationMode>{},
  refusedGifts: [],
  origin: <CartOrigin>{},
  custom: <CustomFields>{
    type: {
      typeId: 'type',
      id: defaultTypeId,
    },
    fields: {},
  },
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
  let productMapper: ProductMapper;
  let taxCategoriesService: MockedTaxCategoriesService;
  let typesService: MockedTypesService;
  let voucherifyConnectorService: MockedVoucherifyConnectorService;
  let commerceToolsConnectorService: MockedCommerceToolsConectorService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        ProductMapper,
        ConfigService,
        Logger,
        {
          provide: REQUEST_JSON_LOGGER,
          useFactory: async () => {
            if (process.env.DEBUG_STORE_REQUESTS_IN_JSON !== 'true') {
              return new NoOpRequestJsonLogger();
            }

            const requestsDir = process.env.DEBUG_STORE_REQUESTS_DIR;
            if (!requestsDir) {
              throw new Error(
                'Please provide value of DEBUG_STORE_REQUESTS_DIR env variable!',
              );
            }
            await mkdirp(path.join(process.cwd(), requestsDir));
            return new RequestJsonFileLogger(requestsDir);
          },
        },
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
        {
          provide: CommerceToolsConnectorService,
          useValue: CommerceToolsConnectorService,
        },
        {
          provide: Logger,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          useValue: { debug: () => {}, error: () => {} },
        },
      ],
    }).compile();

    cartService = app.get<CartService>(CartService);
    productMapper = app.get<ProductMapper>(ProductMapper);
    taxCategoriesService = app.get<TaxCategoriesService>(
      TaxCategoriesService,
    ) as MockedTaxCategoriesService;
    typesService = app.get<TypesService>(TypesService) as MockedTypesService;
    voucherifyConnectorService = app.get<VoucherifyConnectorService>(
      VoucherifyConnectorService,
    ) as MockedVoucherifyConnectorService;
    commerceToolsConnectorService = app.get<CommerceToolsConnectorService>(
      CommerceToolsConnectorService,
    ) as MockedCommerceToolsConectorService;
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

        commerceToolsConnectorService.__simulateGetClient();
      });

      it('should create "setCustomField" action with empty values and "setLineItemCustomType" with no fields for each lineItem', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        expect(result.actions).toEqual([
          {
            action: 'setCustomField',
            name: 'shippingProductSourceIds',
            value: [],
          },
          {
            action: 'setCustomField',
            name: 'couponsLimit',
            value: 5,
          },
          {
            action: 'setCustomField',
            name: 'discount_codes',
            value: [],
          },
          {
            action: 'setCustomField',
            name: 'isValidationFailed',
            value: false,
          },
          {
            action: 'setLineItemCustomType',
            fields: {},
            lineItemId: `line-item-id-${lineItemCounter}`,
            type: {
              key: 'lineItemCodesType',
            },
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
              de: 'Gutscheincodes rabatt',
              en: 'Coupon codes discount',
            },
            quantity: 1,
            money: buildPriceValue(2000, 'EUR'),
            slug: 'Voucher, ',
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

        commerceToolsConnectorService.__simulateGetClient();

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
        ).toBeCalledWith(
          [
            {
              code: 'AMOUNT20',
              status: 'NEW',
            },
          ],
          cart,
          productMapper.mapLineItems(cart.lineItems),
          null,
        );
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
            de: 'Gutscheincodes rabatt',
            en: 'Coupon codes discount',
          },
          quantity: 1,
          money: {
            centAmount: 0,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: 'Voucher, ',
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
              type: 'voucher',
              value: 2000,
            }),
          ],
        });
      });
    });

    describe('when one-time -20€ amount voucher is provided in another cart within another session', () => {
      let cart;
      const COUPON_CODE = 'AMOUNT20';
      const NEW_SESSION_ID = 'new-session-id';

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 2;
        setupCouponCodes(cart, {
          code: COUPON_CODE,
          status: 'NEW',
        } as Coupon);
        cart.custom.fields.session = NEW_SESSION_ID;

        commerceToolsConnectorService.__simulateGetClient();

        voucherifyConnectorService
          .__simulateInvalidValidation()
          .__withInapplicableCoupon(COUPON_CODE);
      });

      it('should call voucherify exactly once using session identifier', async () => {
        await cartService.checkCartAndMutate(cart);

        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledTimes(1);
        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledWith(
          [
            {
              code: COUPON_CODE,
              status: 'NEW',
            },
          ],
          cart,
          productMapper.mapLineItems(cart.lineItems),
          NEW_SESSION_ID,
        );
      });

      it('should return only one `setCustomField` action with information about failure', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        expect(result).toEqual({
          status: true,
          actions: [
            {
              action: 'setCustomField',
              name: 'discount_codes',
              value: [
                '{"code":"AMOUNT20","status":"NOT_APPLIED","errMsg":"quantity exceeded"}',
              ],
            },
          ],
          validateCouponsResult: {
            allInapplicableCouponsArePromotionTier: false,
            availablePromotions: [],
            applicableCoupons: [],
            couponsLimit: 5,
            notApplicableCoupons: [
              {
                status: 'INAPPLICABLE',
                id: 'AMOUNT20',
                object: 'voucher',
                result: {
                  error: {
                    code: 400,
                    key: 'quantity_exceeded',
                    message: 'quantity exceeded',
                    details: 'AMOUNT20',
                    request_id: 'v-123123123123',
                  },
                },
              },
            ],
            skippedCoupons: [],
            newSessionKey: null,
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

    describe('when trying to apply inexistent coupon code', () => {
      let cart;
      const COUPON_CODE = 'NOT EXIST';

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 2;
        setupCouponCodes(cart, {
          code: COUPON_CODE,
          status: 'NEW',
        } as Coupon);

        commerceToolsConnectorService.__simulateGetClient();

        voucherifyConnectorService
          .__simulateInvalidValidation()
          .__withInexistentCoupon(COUPON_CODE);
      });

      it('should call voucherify exactly once', async () => {
        await cartService.checkCartAndMutate(cart);

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

      it('should return only one `setCustomField` action with information about failure', async () => {
        const result = await cartService.checkCartAndMutate(cart);
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
            newSessionKey: undefined,
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

    describe('when another -20€ amount voucher is provided after -10% coupon in one session', () => {
      let cart;
      const FIRST_COUPON_CODE = 'PERC10';
      const SECOND_COUPON_CODE = 'AMOUNT20';
      const SESSION_KEY = 'existing-session-id';

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 2;
        setupCouponCodes(
          cart,
          {
            code: FIRST_COUPON_CODE,
            status: 'APPLIED',
            value: 2650,
          } as Coupon,
          {
            code: SECOND_COUPON_CODE,
            status: 'NEW',
          } as Coupon,
        );
        cart.custom.fields.session = SESSION_KEY;

        commerceToolsConnectorService.__simulateGetClient();

        voucherifyConnectorService
          .__simulateDefaultValidateStackable()
          .__useCartAsOrderReference(cart)
          .__addPercentageRateCoupon(FIRST_COUPON_CODE, 10)
          .__addDiscountCoupon(SECOND_COUPON_CODE, 2000)
          .__useSessionKey(SESSION_KEY);
      });

      it('should call voucherify once', async () => {
        await cartService.checkCartAndMutate(cart);

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
              status: 'NEW',
            },
          ],
          cart,
          productMapper.mapLineItems(cart.lineItems),
          SESSION_KEY,
        );
      });

      it('should create one `addCustomLineItem` action with all coupons value combined', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const addCustomLineItemActions = result.actions.filter(
          byActionType('addCustomLineItem'),
        );
        expect(addCustomLineItemActions.length).toBe(1);
        expect(addCustomLineItemActions[0]).toEqual({
          action: 'addCustomLineItem',
          name: {
            de: 'Gutscheincodes rabatt',
            en: 'Coupon codes discount',
          },
          quantity: 1,
          money: {
            centAmount: 0,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: `Voucher, `,
          taxCategory: {
            id: defaultGetCouponTaxCategoryResponse.id,
          },
        });
      });

      it('should create one `setCustomField` action with all coupons applied', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setCustomFieldActions = result.actions.filter(
          byActionType('setCustomField'),
        );
        expect(setCustomFieldActions.length).toBe(3);
        expect(setCustomFieldActions[2]).toEqual({
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
        });
      });
    });

    describe('when two discount codes (percentage and amount) are already applied and quantity of items have been updated', () => {
      let cart;
      const FIRST_COUPON_CODE = 'PERC10';
      const SECOND_COUPON_CODE = 'AMOUNT20';
      const SESSION_KEY = 'existing-session-id';

      beforeEach(() => {
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

        commerceToolsConnectorService.__simulateGetClient();

        voucherifyConnectorService
          .__simulateDefaultValidateStackable()
          .__useCartAsOrderReference(cart)
          .__addPercentageRateCoupon(FIRST_COUPON_CODE, 10)
          .__addDiscountCoupon(SECOND_COUPON_CODE, 2000)
          .__useSessionKey(SESSION_KEY);
      });

      it('should call voucherify to validate applied coupons again against updated cart', async () => {
        await cartService.checkCartAndMutate(cart);

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
        const result = await cartService.checkCartAndMutate(cart);

        const addCustomLineItemActions = result.actions.filter(
          byActionType('addCustomLineItem'),
        );
        expect(addCustomLineItemActions.length).toBe(1);
        expect(addCustomLineItemActions[0]).toEqual({
          action: 'addCustomLineItem',
          name: {
            de: 'Gutscheincodes rabatt',
            en: 'Coupon codes discount',
          },
          quantity: 1,
          money: {
            centAmount: 0,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: `Voucher, `,
          taxCategory: {
            id: defaultGetCouponTaxCategoryResponse.id,
          },
        });
      });

      it('should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setCustomFieldActions = result.actions.filter(
          byActionType('setCustomField'),
        );
        expect(setCustomFieldActions.length).toBe(3);
        expect(setCustomFieldActions[2]).toEqual({
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
        });
      });
    });

    describe('when applying discount code on a specific product in the cart', () => {
      let cart;
      const COUPON_CODE = 'SNEAKERS30';
      const PRODUCT_ID = 'discounted-sneakers';
      const SESSION_KEY = 'existing-session-id';
      const PRICE = 20000;

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 2;
        cart.lineItems = [
          createLineItem({
            name: 'Sneakers',
            productId: PRODUCT_ID,
            sku: `sku${PRODUCT_ID}`,
            price: PRICE,
            netPrice: 16807,
            vatValue: 3193,
            quantity: 1,
          }),
        ];
        cart.totalPrice = buildPriceValue(PRICE, 'EUR');
        setupCouponCodes(cart, {
          status: 'NEW',
          code: COUPON_CODE,
        } as Coupon);
        cart.custom.fields.session = SESSION_KEY;

        commerceToolsConnectorService.__simulateGetClient();

        voucherifyConnectorService
          .__simulateDefaultValidateStackable()
          .__useCartAsOrderReference(cart)
          .__addProductDiscount(COUPON_CODE, PRODUCT_ID, 3000)
          .__useSessionKey(SESSION_KEY);
      });

      it('call voucherify once', async () => {
        await cartService.checkCartAndMutate(cart);

        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledTimes(1);
        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledWith(
          [
            {
              code: 'SNEAKERS30',
              status: 'NEW',
            },
          ],
          cart,
          productMapper.mapLineItems(cart.lineItems),
          SESSION_KEY,
        );
      });

      it('should create `addCustomLineItem` action with total coupons value applied', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const addCustomLineItemActions = result.actions.filter(
          byActionType('addCustomLineItem'),
        );
        expect(addCustomLineItemActions.length).toBe(1);
        expect(addCustomLineItemActions[0]).toEqual({
          action: 'addCustomLineItem',
          name: {
            de: 'Gutscheincodes rabatt',
            en: 'Coupon codes discount',
          },
          quantity: 1,
          money: {
            centAmount: -3000,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: 'Voucher, ',
          taxCategory: {
            id: defaultGetCouponTaxCategoryResponse.id,
          },
        });
      });

      it('should create three `setCustomField` with default values and action with storing coupon details to the cart', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setCustomFieldActions = result.actions.filter(
          byActionType('setCustomField'),
        );
        expect(setCustomFieldActions.length).toBe(3);
        expect(setCustomFieldActions[2]).toEqual({
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            JSON.stringify({
              code: COUPON_CODE,
              status: 'APPLIED',
              type: 'voucher',
              value: 3000,
            }),
          ],
        });
      });
    });

    describe('when applying discount code which adds free product to the cart', () => {
      let cart;
      const COUPON_CODE = 'ADD_GIFT';
      const SKU_ID = 'gift-sku-id';
      const PRODUCT_ID = 'gift-product-id';
      const SESSION_KEY = 'existing-session-id';
      const PRODUCT_PRICE = 6500;

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 2;
        setupCouponCodes(cart, {
          status: 'NEW',
          code: COUPON_CODE,
        } as Coupon);
        cart.custom.fields.session = SESSION_KEY;

        commerceToolsConnectorService.__simulateGetClient({
          sku: SKU_ID,
          price: PRODUCT_PRICE,
          id: PRODUCT_ID,
        });

        voucherifyConnectorService
          .__simulateDefaultValidateStackable()
          .__useCartAsOrderReference(cart)
          .__addGiftProductToCartDiscount(
            COUPON_CODE,
            SKU_ID,
            PRODUCT_ID,
            PRODUCT_PRICE,
          )
          .__useSessionKey(SESSION_KEY);
      });

      it('should call voucherify once', async () => {
        await cartService.checkCartAndMutate(cart);

        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledTimes(1);
        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledWith(
          [
            {
              code: 'ADD_GIFT',
              status: 'NEW',
            },
          ],
          cart,
          productMapper.mapLineItems(cart.lineItems),
          SESSION_KEY,
        );
      });

      it('should create `addLineItem` action with gift product', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const addLineItemActions = result.actions.filter(
          byActionType('addLineItem'),
        );
        expect(addLineItemActions.length).toBe(1);
        expect(addLineItemActions[0]).toEqual({
          action: 'addLineItem',
          sku: SKU_ID,
          quantity: 1,
          custom: {
            typeKey: 'lineItemCodesType',
            fields: {
              applied_codes: [
                JSON.stringify({
                  code: COUPON_CODE,
                  type: 'UNIT',
                  effect: 'ADD_NEW_ITEMS',
                  quantity: 1,
                  totalDiscountQuantity: 1,
                }),
              ],
            },
          },
        });
      });

      it('should create `addCustomLineItem` action with total coupons value applied', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const addCustomLineItemActions = result.actions.filter(
          byActionType('addCustomLineItem'),
        );
        expect(addCustomLineItemActions.length).toBe(1);
        expect(addCustomLineItemActions[0]).toEqual({
          action: 'addCustomLineItem',
          name: {
            de: 'Gutscheincodes rabatt',
            en: 'Coupon codes discount',
          },
          quantity: 1,
          money: {
            centAmount: -6500,
            type: 'centPrecision',
            currencyCode: 'EUR',
          },
          slug: 'Voucher, ',
          taxCategory: {
            id: defaultGetCouponTaxCategoryResponse.id,
          },
        });
      });

      it('should create three `setCustomField` for default customFields settings and action storing coupon details to the cart', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setCustomFieldActions = result.actions.filter(
          byActionType('setCustomField'),
        );
        expect(setCustomFieldActions.length).toBe(3);
        expect(setCustomFieldActions[2]).toEqual({
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            JSON.stringify({
              code: COUPON_CODE,
              status: 'APPLIED',
              type: 'voucher',
              value: 6500,
            }),
          ],
        });
      });
    });

    describe('when adding new product to the cart with free product already applied (via coupon)', () => {
      let cart;
      const COUPON_CODE = 'ADD_GIFT';
      const SKU_ID = 'gift-sku-id';
      const PRODUCT_ID = 'gift-product-id';
      const SESSION_KEY = 'existing-session-id';
      const PRODUCT_PRICE = 6500;

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 20;
        const item = createLineItem({
          name: 'Free product',
          productId: PRODUCT_ID,
          sku: SKU_ID,
          price: PRODUCT_PRICE,
          netPrice: 5462,
          vatValue: 1038,
          quantity: 1,
        }) as any;
        item.custom = {
          fields: {
            applied_codes: [
              JSON.stringify({ code: COUPON_CODE, type: 'UNIT', quantity: 1 }),
            ],
          },
        };
        cart.lineItems.push(item);
        cart.amount += PRODUCT_PRICE;
        cart.discount_amount = PRODUCT_PRICE;
        setupCouponCodes(cart, {
          status: 'APPLIED',
          code: COUPON_CODE,
          value: PRODUCT_PRICE,
        } as Coupon);
        cart.custom.fields.session = SESSION_KEY;

        commerceToolsConnectorService.__simulateGetClient({
          sku: SKU_ID,
          price: PRODUCT_PRICE,
          id: PRODUCT_ID,
        });

        voucherifyConnectorService
          .__simulateDefaultValidateStackable()
          .__useCartAsOrderReference(cart)
          .__addGiftProductToCartDiscount(
            COUPON_CODE,
            SKU_ID,
            PRODUCT_ID,
            PRODUCT_PRICE,
          )
          .__useSessionKey(SESSION_KEY);
      });

      it('should call voucherify once', async () => {
        await cartService.checkCartAndMutate(cart);

        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledTimes(1);
        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledWith(
          [
            {
              code: 'ADD_GIFT',
              status: 'APPLIED',
              value: 6500,
            },
          ],
          cart,
          productMapper.mapLineItems(cart.lineItems),
          SESSION_KEY,
        );
      });

      it('should create one `addCustomLineItem` action with summary of applied coupon', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const addCustomLineItemActions = result.actions.filter(
          byActionType('addCustomLineItem'),
        );
        expect(addCustomLineItemActions.length).toBe(1);
        expect(addCustomLineItemActions[0]).toEqual({
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
        });
      });

      it('should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setCustomFieldActions = result.actions.filter(
          byActionType('setCustomField'),
        );
        expect(setCustomFieldActions.length).toBe(3);
        expect(setCustomFieldActions[2]).toEqual({
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
        });
      });
    });

    describe('when applying coupon code for a free product with `ADD_MISSING_ITEMS` effect and having that product already in cart', () => {
      let cart;
      const COUPON_CODE = 'ADD_GIFT';
      const SKU_ID = 'gift-sku-id';
      const PRODUCT_ID = 'gift-product-id';
      const SESSION_KEY = 'existing-session-id';
      const PRODUCT_PRICE = 6500;
      let lineItemId;

      beforeEach(() => {
        cart = defaultCart();
        cart.version = 20;
        const item = createLineItem({
          name: 'Free product',
          productId: PRODUCT_ID,
          sku: SKU_ID,
          price: PRODUCT_PRICE,
          netPrice: 5462,
          vatValue: 1038,
          quantity: 1,
        });
        lineItemId = item.id;
        cart.lineItems.push(item);
        setupCouponCodes(cart, {
          code: COUPON_CODE,
          status: 'NEW',
        });
        cart.amount += PRODUCT_PRICE;
        cart.custom.fields.session = SESSION_KEY;

        commerceToolsConnectorService.__simulateGetClient({
          sku: SKU_ID,
          price: PRODUCT_PRICE,
          id: PRODUCT_ID,
        });

        voucherifyConnectorService
          .__simulateDefaultValidateStackable()
          .__useCartAsOrderReference(cart)
          .__addGiftProductToCartDiscount(
            COUPON_CODE,
            SKU_ID,
            PRODUCT_ID,
            PRODUCT_PRICE,
            'ADD_MISSING_ITEMS',
          )
          .__useSessionKey(SESSION_KEY);
      });

      it('should call voucherify once', async () => {
        await cartService.checkCartAndMutate(cart);

        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledTimes(1);
        expect(
          voucherifyConnectorService.validateStackableVouchersWithCTCart,
        ).toBeCalledWith(
          [
            {
              code: 'ADD_GIFT',
              status: 'NEW',
            },
          ],
          cart,
          productMapper.mapLineItems(cart.lineItems),
          SESSION_KEY,
        );
      });

      it('should create one `addCustomLineItem` with applied coupon summary', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const addCustomLineItemActions = result.actions.filter(
          byActionType('addCustomLineItem'),
        );
        expect(addCustomLineItemActions.length).toBe(1);
        expect(addCustomLineItemActions[0]).toEqual({
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
        });
      });

      it('should create one `changeLineItemQuantity` action with the id of the discounted product', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const changeLineItemQuantityActions = result.actions.filter(
          byActionType('changeLineItemQuantity'),
        );
        expect(changeLineItemQuantityActions.length).toBe(1);
        expect(changeLineItemQuantityActions[0]).toEqual({
          action: 'changeLineItemQuantity',
          lineItemId,
          quantity: 1,
        });
      });

      it("should create one `setLineItemCustomType` action to apply items' applied_codes and one `setLineItemCustomType` to one remaining line item in cart to remove all customTypes from it", async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setLineItemCustomTypeActions = result.actions.filter(
          byActionType('setLineItemCustomType'),
        );

        expect(setLineItemCustomTypeActions.length).toBe(2);
        expect(setLineItemCustomTypeActions[0]).toEqual({
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
        });
      });

      it('should create three `setCustomField` for default customFields settings and action with all coupons applied', async () => {
        const result = await cartService.checkCartAndMutate(cart);

        const setCustomFieldActions = result.actions.filter(
          byActionType('setCustomField'),
        );
        expect(setCustomFieldActions.length).toBe(3);
        expect(setCustomFieldActions[2]).toEqual({
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
        });
      });
    });
  });
});
