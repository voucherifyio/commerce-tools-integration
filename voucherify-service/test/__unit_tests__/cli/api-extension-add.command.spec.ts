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
import { ApiExtensionAddCommand } from '../../../src/cli/api-extension-add.command';

describe('ApiExtensionAddCommand', () => {
  let command: ApiExtensionAddCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        ApiExtensionAddCommand,
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
    }).compile();

    command = module.get<ApiExtensionAddCommand>(ApiExtensionAddCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should be defined', () => {
    expect(command.run).toBeDefined();
  });
});
