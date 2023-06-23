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
import { ApiExtensionAddCommand } from '../../cli/api-extension-add.command';

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
