import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../../src/configs/requestJsonLogger';
import { CustomTypesService } from '../../src/commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../../src/commercetools/tax-categories/tax-categories.service';
import { CommercetoolsConnectorService } from '../../src/commercetools/commercetools-connector.service';
import { CommercetoolsService } from '../../src/commercetools/commercetools.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { getCommerceToolsConnectorServiceMockForCommerceToolsServiceTest } from '../__mocks__/commerce-tools-connector.service';
import { cart } from './payloads/commercetools.service.spec.payloads';
import { getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse } from '../__mocks__/tax-categories.service';
import { getTypesServiceMockWithConfiguredCouponTypeResponse } from '../__mocks__/types.service';

const moduleMocker = new ModuleMocker(global);

describe('CommerceToolsService', () => {
  let service: CommercetoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: getConfigForCommerceToolsServiceTest(),
        },
        CommercetoolsService,
        {
          provide: CommercetoolsConnectorService,
          useValue:
            getCommerceToolsConnectorServiceMockForCommerceToolsServiceTest(
              cart,
            ),
        },
        { provide: Logger, useValue: getLoggerForCommerceToolsServiceTest() },
        {
          provide: CustomTypesService,
          useValue: getTypesServiceMockWithConfiguredCouponTypeResponse(),
        },
        {
          provide: TaxCategoriesService,
          useValue:
            getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse(),
        },
        RequestJsonLogger,
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get<CommercetoolsService>(CommercetoolsService);
    service.setCartUpdateListener(jest.fn().mockReturnValue(undefined));
    service.setOrderPaidListener(jest.fn().mockReturnValue(undefined));
  });

  it('all service methods should be defined', () => {
    expect(service.handleCartUpdate).toBeDefined();
    expect(service.handleAPIExtensionTimeoutOnCartUpdate).toBeDefined();
    expect(service.checkIfCartStatusIsPaidAndRedeem).toBeDefined();
    expect(service.setCustomTypeForInitializedCart).toBeDefined();
  });

  it('expect to return undefined when building response time is lower than maxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut', async () => {
    const result = await service.handleAPIExtensionTimeoutOnCartUpdate(
      cart as any,
      0,
    );
    expect(result).toBeUndefined();
  });

  it('expect to return undefined when higher version of cart was found', async () => {
    const copyOfCart = { ...cart };
    copyOfCart.version = 5;
    const result = await service.handleAPIExtensionTimeoutOnCartUpdate(
      cart as any,
      2,
    );
    expect(result).toBeUndefined();
  });

  it('expect to return undefined when cartUpdateHandler is not a function', async () => {
    service.setCartUpdateListener(undefined);
    const result = await service.handleAPIExtensionTimeoutOnCartUpdate(
      cart as any,
      2,
    );
    expect(result).toBeUndefined();
  });

  it('expect to return undefined when cartUpdateHandler is a function, this.cartUpdateHandler to be called 1 time', async () => {
    const mockFunction = jest.fn().mockResolvedValue(undefined);
    service.setCartUpdateListener(mockFunction);
    const result = await service.handleAPIExtensionTimeoutOnCartUpdate(
      cart as any,
      2,
    );
    expect(result).toBeUndefined();
  });

  it('Expect to return empty actions and return status false when setCartUpdateListener is not configured', async () => {
    service.setCartUpdateListener(undefined);
    const result = await service.handleCartUpdate(cart as any);
    expect(result).toEqual({
      status: false,
      actions: [],
    });
  });

  it('Expect to build actions and return status true for correct CT cart when setCartUpdateListener is configured', async () => {
    const mockFunction = (cart, cartUpdateActions) => {
      cartUpdateActions.setSessionKey('ssn_7j0LyRRIH7u9NaJVNmHkCtmky7Qezmnt');
      cartUpdateActions.setTotalDiscountAmount(1000);
      cartUpdateActions.setApplicableCoupons([
        {
          status: 'APPLICABLE',
          id: '10off',
          object: 'voucher',
          order: {
            source_id: '66567cb6-68e0-44fa-9cf5-3dee728dc396',
            amount: 37000,
            discount_amount: 1000,
            total_discount_amount: 1000,
            total_amount: 36000,
            applied_discount_amount: 1000,
            total_applied_discount_amount: 1000,
            items: [
              {
                object: 'order_item',
                source_id: 'M0E20000000EE54',
                related_object: 'sku',
                quantity: 1,
                amount: 18500,
                price: 18500,
                subtotal_amount: 18500,
                product: { name: 'Jeans Cycle dark blue', override: true },
                sku: {
                  sku: 'Jeans Cycle dark blue',
                  metadata: {},
                  override: true,
                },
              },
              {
                object: 'order_item',
                source_id: 'M0E20000000EE54',
                related_object: 'sku',
                quantity: 1,
                amount: 18500,
                price: 18500,
                subtotal_amount: 18500,
                product: { name: 'Jeans Cycle dark blue', override: true },
                sku: {
                  sku: 'Jeans Cycle dark blue',
                  metadata: {},
                  override: true,
                },
              },
            ],
            metadata: {},
            customer_id: null,
            referrer_id: null,
            object: 'order',
          },
          applicable_to: {
            data: [],
            total: 0,
            data_ref: 'data',
            object: 'list',
          },
          inapplicable_to: {
            data: [],
            total: 0,
            data_ref: 'data',
            object: 'list',
          },
          result: {
            discount: {
              type: 'AMOUNT',
              effect: 'APPLY_TO_ORDER',
              amount_off: 1000,
              is_dynamic: false,
            },
          },
        },
      ]);
    };
    service.setCartUpdateListener(mockFunction as any);
    const result = await service.handleCartUpdate(cart as any);
    expect(result).toEqual({
      status: true,
      actions: [
        {
          action: 'setDirectDiscounts',
          discounts: [
            {
              target: { type: 'lineItems', predicate: 'true' },
              value: {
                type: 'absolute',
                money: [{ centAmount: 1000, currencyCode: 'USD' }],
              },
            },
          ],
        },
        {
          action: 'setLineItemCustomType',
          lineItemId: 'd52307c5-1cc4-400b-9459-121da2d261e5',
          type: { key: 'lineItemCodesType' },
          fields: {},
        },
        {
          action: 'setCustomField',
          name: 'session',
          value: 'ssn_7j0LyRRIH7u9NaJVNmHkCtmky7Qezmnt',
        },
        {
          action: 'setCustomField',
          name: 'discount_codes',
          value: [
            '{"code":"10off","status":"APPLIED","type":"voucher","value":1000}',
          ],
        },
        {
          action: 'setCustomField',
          name: 'shippingProductSourceIds',
          value: [],
        },
      ],
    });
  });
});

const getConfigForCommerceToolsServiceTest = () => {
  const configService =
    jest.createMockFromModule<ConfigService>('@nestjs/config');
  configService.get = jest.fn((key) => {
    if (
      key ===
      'MAX_CART_UPDATE_RESPONSE_TIME_WITHOUT_CHECKING_IF_API_EXTENSION_TIMED_OUT'
    ) {
      return 1;
    }
    if (key === 'APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT') {
      return 'true';
    }
    return null;
  });
  return configService;
};

const getLoggerForCommerceToolsServiceTest = () => {
  const logger = jest.createMockFromModule('@nestjs/common') as Logger;

  logger.error = jest.fn().mockReturnValue(undefined);
  logger.debug = jest.fn().mockReturnValue(undefined);

  return logger;
};
