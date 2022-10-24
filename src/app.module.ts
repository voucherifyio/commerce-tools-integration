import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoucherifyConnectorService } from './voucherify/voucherify-connector.service';
import { CommerceToolsConnectorService } from './commerceTools/commerce-tools-connector.service';
import { ApiExtensionController } from './api-extension/api-extension.controller';
import { CartService } from './api-extension/cart.service';
import { ApiExtensionService } from './api-extension/api-extension.service';
import { TaxCategoriesService } from './commerceTools/tax-categories/tax-categories.service';
import { TaxCategoriesController } from './commerceTools/tax-categories/tax-categories.controller';
import { TypesController } from './commerceTools/types/types.controller';
import { TypesService } from './commerceTools/types/types.service';
import { OrderService } from './api-extension/order.service';
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
import { OrderMapper } from './api-extension/mappers/order';
import { ProductMapper } from './api-extension/mappers/product';
import { ValidationSchema } from './configs/validationSchema';
import { AppValidationPipe } from './configs/appValidationPipe';
import { RequestJsonLogger } from './configs/requestJsonLogger';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: ValidationSchema,
    }),
    IntegrationModule,
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
    CommerceToolsConnectorService,
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
  ],
})
export class AppModule {}
