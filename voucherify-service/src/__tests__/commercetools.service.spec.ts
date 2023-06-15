import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../configs/requestJsonLogger';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { CommercetoolsService } from '../commercetools/commercetools.service';

describe('CommerceToolsService', () => {
  let service: CommercetoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        CommercetoolsService,
        CommercetoolsConnectorService,
        ConfigService,
        Logger,
        CustomTypesService,
        TaxCategoriesService,
        RequestJsonLogger,
      ],
    }).compile();

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
