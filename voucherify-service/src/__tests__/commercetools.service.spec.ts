import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../configs/requestJsonLogger';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('CommerceToolsService', () => {
  let service: CommercetoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigModule,
        CommercetoolsService,
        CommercetoolsConnectorService,
        ConfigService,
        Logger,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(service.handleCartUpdate).toBeDefined();
    expect(service.handleAPIExtensionTimeoutOnCartUpdate).toBeDefined();
    expect(service.checkIfCartStatusIsPaidAndRedeem).toBeDefined();
  });
});
