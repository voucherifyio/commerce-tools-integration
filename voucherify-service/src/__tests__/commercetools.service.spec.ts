import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../configs/requestJsonLogger';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { getCommerceToolsConnectorServiceMockForCommerceToolsServiceTest } from '../commercetools/__mocks__/commerce-tools-connector.service';
import { cart } from './payloads/commercetools.service.spec.payloads';

const moduleMocker = new ModuleMocker(global);

describe('CommerceToolsService', () => {
  let service: CommercetoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigModule,
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
        ConfigService,
        { provide: Logger, useValue: getLoggerForCommerceToolsServiceTest() },
        CustomTypesService,
        TaxCategoriesService,
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
