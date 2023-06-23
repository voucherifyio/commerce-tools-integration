import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../configs/requestJsonLogger';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { MigrateCommand } from '../cli/migrate.command';
import { ProductImportService } from '../import/product-import.service';
import { OrderImportService } from '../import/order-import.service';
import { CustomerImportService } from '../import/customer-import.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { OrderMapper } from '../integration/utils/mappers/order';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { ConfigCommand } from '../cli/config.command';
import { getCommerceToolsConnectorServiceMockWithCouponTypes } from '../commercetools/__mocks__/commerce-tools-connector.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ConfigCommand', () => {
  let command: CustomTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigModule,
        MigrateCommand,
        ProductImportService,
        OrderImportService,
        CustomerImportService,
        {
          provide: CommercetoolsConnectorService,
          useValue: getCommerceToolsConnectorServiceMockWithCouponTypes(),
        },
        VoucherifyConnectorService,
        CommercetoolsService,
        CustomTypesService,
        TaxCategoriesService,
        ConfigCommand,
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

    command = module.get<CustomTypesService>(CustomTypesService);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should be defined', () => {
    command.findCouponType('test');
    expect(command.findCouponType).toBeDefined();
    command.configureCouponTypes();
    expect(command.configureCouponTypes).toBeDefined();
  });
});
