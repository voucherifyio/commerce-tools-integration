import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoucherifyConnectorService } from './voucherify/voucherify-connector.service';
import { CommercetoolsConnectorService } from './commercetools/commercetools-connector.service';
import { ApiExtensionController } from './commercetools/api-extension.controller';
import { IntegrationService } from './integration/integration.service';
import { ApiExtensionService } from './commercetools/api-extension.service';
import { TaxCategoriesService } from './commercetools/tax-categories/tax-categories.service';
import { CustomTypesService } from './commercetools/custom-types/custom-types.service';
import { ProductImportService } from './import/product-import.service';
import { ImportController } from './import/import.controller';
import { OrderImportService } from './import/order-import.service';
import { CustomerImportService } from './import/customer-import.service';
import { ApiExtensionAddCommand } from './cli/api-extension-add.command';
import { ApiExtensionDeleteCommand } from './cli/api-extension-delete.command';
import { ApiExtensionUpdateCommand } from './cli/api-extension-update.command';
import { ApiExtensionListCommand } from './cli/api-extension-list.command';
import { ConfigCommand } from './cli/config.command';
import { UnconfigCommand } from './cli/unconfig.command';
import { MigrateCommand } from './cli/migrate.command';
import { OrderMapper } from './integration/utils/mappers/order';
import { ValidationSchema } from './configs/validationSchema';
import { AppValidationPipe } from './configs/appValidationPipe';
import { RequestJsonLogger } from './configs/requestJsonLogger';
import { CommercetoolsService } from './commercetools/commercetools.service';
import { VoucherifyService } from './voucherify/voucherify.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: ValidationSchema,
    }),
  ],
  controllers: [AppController, ApiExtensionController, ImportController],
  providers: [
    Logger,
    AppService,
    IntegrationService,
    ApiExtensionService,
    VoucherifyConnectorService,
    CommercetoolsConnectorService,
    TaxCategoriesService,
    CustomTypesService,
    ProductImportService,
    OrderImportService,
    CustomerImportService,
    ApiExtensionAddCommand,
    ApiExtensionDeleteCommand,
    MigrateCommand,
    ConfigCommand,
    UnconfigCommand,
    ApiExtensionListCommand,
    ApiExtensionUpdateCommand,
    OrderMapper,
    AppValidationPipe,
    RequestJsonLogger,
    CommercetoolsService,
    VoucherifyService,
  ],
})
export class AppModule {}
