import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../configs/requestJsonLogger';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { ApiExtensionService } from '../commercetools/api-extension.service';

describe('ApiExtensionService', () => {
  let service: ApiExtensionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        ConfigModule,
        ApiExtensionService,
        CommercetoolsConnectorService,
        Logger,
        RequestJsonLogger,
      ],
    }).compile();

    service = module.get<ApiExtensionService>(ApiExtensionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(service.list).toBeDefined();
    expect(service.removeById).toBeDefined();
    expect(service.removeByAttr).toBeDefined();
    expect(service.add).toBeDefined();
    expect(service.update).toBeDefined();
  });
});
