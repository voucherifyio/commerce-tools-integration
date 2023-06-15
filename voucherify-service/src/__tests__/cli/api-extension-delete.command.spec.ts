import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../../configs/requestJsonLogger';
import { CommercetoolsConnectorService } from '../../commercetools/commercetools-connector.service';
import { ApiExtensionService } from '../../commercetools/api-extension.service';
import { MigrateCommand } from '../../cli/migrate.command';
import { ProductImportService } from '../../import/product-import.service';
import { OrderImportService } from '../../import/order-import.service';
import { CustomerImportService } from '../../import/customer-import.service';
import { VoucherifyConnectorService } from '../../voucherify/voucherify-connector.service';
import { OrderMapper } from '../../integration/utils/mappers/order';
import { CommercetoolsService } from '../../commercetools/commercetools.service';
import { CustomTypesService } from '../../commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../../commercetools/tax-categories/tax-categories.service';
import { ApiExtensionUpdateCommand } from '../../cli/api-extension-update.command';
import { ApiExtensionListCommand } from '../../cli/api-extension-list.command';
import { ApiExtensionDeleteCommand } from '../../cli/api-extension-delete.command';
import {
  getCommerceToolsConnectorServiceMockForAPIExtensionServiceTest,
  getConfigForAPIExtensionServiceTest,
} from '../../commercetools/__mocks__/commerce-tools-connector.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ApiExtensionDeleteCommand', () => {
  let command: ApiExtensionDeleteCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigModule,
          useValue: getConfigForAPIExtensionServiceTest(),
        },
        ApiExtensionDeleteCommand,
        ApiExtensionService,
        MigrateCommand,
        ProductImportService,
        OrderImportService,
        CustomerImportService,
        {
          provide: CommercetoolsConnectorService,
          useValue:
            getCommerceToolsConnectorServiceMockForAPIExtensionServiceTest(),
        },
        VoucherifyConnectorService,
        CommercetoolsService,
        CustomTypesService,
        TaxCategoriesService,
        OrderMapper,
        Logger,
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

    command = module.get<ApiExtensionDeleteCommand>(ApiExtensionDeleteCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should be defined', async () => {
    await command.run([], { id: '123' });
    expect(command.run).toBeDefined();
  });
});
