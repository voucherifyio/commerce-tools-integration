import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../../../src/configs/requestJsonLogger';
import { CommercetoolsConnectorService } from '../../../src/commercetools/commercetools-connector.service';
import { ApiExtensionService } from '../../../src/commercetools/api-extension.service';
import { MigrateCommand } from '../../../src/cli/migrate.command';
import { ProductImportService } from '../../../src/import/product-import.service';
import { OrderImportService } from '../../../src/import/order-import.service';
import { CustomerImportService } from '../../../src/import/customer-import.service';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';
import { OrderMapper } from '../../../src/integration/utils/mappers/order';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { CustomTypesService } from '../../../src/commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../../../src/commercetools/tax-categories/tax-categories.service';
import { ApiExtensionUpdateCommand } from '../../../src/cli/api-extension-update.command';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ApiExtensionUpdateCommand', () => {
  let command: ApiExtensionUpdateCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigModule,
        ApiExtensionUpdateCommand,
        ApiExtensionService,
        MigrateCommand,
        ProductImportService,
        OrderImportService,
        CustomerImportService,
        CommercetoolsConnectorService,
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

    command = module.get<ApiExtensionUpdateCommand>(ApiExtensionUpdateCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should be defined', () => {
    expect(command.run).toBeDefined();
  });
});
