import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoucherifyConnectorService } from './voucherify/voucherify-connector.service';
import { CommercetoolsConnectorService } from './commercetools/commercetools-connector.service';
import { ApiExtensionController } from './commercetools/api-extension.controller';
import { CartService } from './integration/cart.service';
import { ApiExtensionService } from './commercetools/api-extension.service';
import { TaxCategoriesService } from './commercetools/tax-categories/tax-categories.service';
import { TaxCategoriesController } from './commercetools/tax-categories/tax-categories.controller';
import { TypesController } from './commercetools/types/types.controller';
import { TypesService } from './commercetools/types/types.service';
import { OrderService } from './integration/order.service';
import { ProductImportService } from './import/product-import.service';
import { ImportController } from './import/import.controller';
import { OrderImportService } from './import/order-import.service';
import { CustomerImportService } from './import/customer-import.service';
import { ApiExtensionAddCommand } from './cli/api-extension-add.command';
import { ApiExtensionDeleteCommand } from './cli/api-extension-delete.command';
import { ApiExtensionUpdateCommand } from './cli/api-extension-update.command';
import { ApiExtensionListCommand } from './cli/api-extension-list.command';
import { ConfigCommand } from './cli/config.command';
import { MigrateCommand } from './cli/migrate.command';
import { OrderMapper } from './integration/mappers/order';
import { ProductMapper } from './integration/mappers/product';
import { ValidationSchema } from './configs/validationSchema';
import { AppValidationPipe } from './configs/appValidationPipe';
import { RequestJsonLogger } from './configs/requestJsonLogger';
import { IntegrationService } from './integration/integration.service';
import { CommercetoolsService } from './commercetools/commercetools.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: ValidationSchema,
    }),
  ],
  controllers: [
    AppController,
    ApiExtensionController,
    TaxCategoriesController,
    TypesController,
    ImportController,
  ],
  providers: [
    Logger,
    AppService,
    CartService,
    ApiExtensionService,
    VoucherifyConnectorService,
    CommercetoolsConnectorService,
    TaxCategoriesService,
    TypesService,
    OrderService,
    ProductImportService,
    OrderImportService,
    CustomerImportService,
    ApiExtensionAddCommand,
    ApiExtensionDeleteCommand,
    MigrateCommand,
    ConfigCommand,
    ApiExtensionListCommand,
    ApiExtensionUpdateCommand,
    OrderMapper,
    ProductMapper,
    AppValidationPipe,
    RequestJsonLogger,
    IntegrationService,
    CommercetoolsService,
  ],
})
export class AppModule {}
