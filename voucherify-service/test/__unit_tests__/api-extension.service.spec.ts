import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../../src/configs/requestJsonLogger';
import { CommercetoolsConnectorService } from '../../src/commercetools/commercetools-connector.service';
import { ApiExtensionService } from '../../src/commercetools/api-extension.service';
import {
  getCommerceToolsConnectorServiceMockForAPIExtensionServiceTest,
  getConfigForAPIExtensionServiceTest,
} from '../__mocks__/commerce-tools-connector.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ApiExtensionService', () => {
  let service: ApiExtensionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiExtensionService,
        {
          provide: CommercetoolsConnectorService,
          useValue:
            getCommerceToolsConnectorServiceMockForAPIExtensionServiceTest(),
        },
        Logger,
        RequestJsonLogger,
        {
          provide: ConfigService,
          useValue: getConfigForAPIExtensionServiceTest(),
        },
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

  it('should be defined', async () => {
    const result = await service.list();
    expect(result).toBeDefined();
  });

  it('should be pass with no error', async () => {
    const result1 = await service.removeById('1234');
    expect(result1).toBeFalsy();
    const result2 = await service.removeById('123');
    expect(result2).toBeFalsy();
  });

  it('should be pass with no error', async () => {
    const result1 = await service.removeByAttr('key', '1234');
    expect(result1).toBeFalsy();
    const result2 = await service.removeByAttr('key', '123');
    expect(result2).toBeFalsy();
  });

  it('should be pass with no error', async () => {
    const result = await service.add('sss.sss/ss', '1234');
    expect(result).toBeFalsy();
  });

  it('should be pass with no error', async () => {
    const result = await service.update('sss.sss/ss');
    expect(result).toBeFalsy();
  });
});
