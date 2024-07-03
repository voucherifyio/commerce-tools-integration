import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../../../src/configs/requestJsonLogger';
import { CommercetoolsConnectorService } from '../../../src/commercetools/commercetools-connector.service';
import { MigrateCommand } from '../../../src/cli/migrate.command';
import { ProductImportService } from '../../../src/import/product-import.service';
import { OrderImportService } from '../../../src/import/order-import.service';
import { CustomerImportService } from '../../../src/import/customer-import.service';
import { VoucherifyConnectorService } from '../../../src/voucherify/voucherify-connector.service';
import { OrderMapper } from '../../../src/integration/utils/mappers/order';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { CustomTypesService } from '../../../src/commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../../../src/commercetools/tax-categories/tax-categories.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('MigrateCommand', () => {
  let command: MigrateCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigModule,
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

    command = module.get<MigrateCommand>(MigrateCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should be defined', () => {
    expect(command.parseType).toBeDefined();
    expect(command.parseDays).toBeDefined();
    expect(command.parseDays('1')).toString();
    expect(command.parseHours('1')).toBeDefined();
    expect(command.parseMs('1')).toBeDefined();
    expect(command.parseDate('2022-02-02')).toBeDefined();
    expect(command.parseLongDate('2022-02-02T10:10:10')).toBeDefined();
    expect(command.run).toBeDefined();
  });
});
