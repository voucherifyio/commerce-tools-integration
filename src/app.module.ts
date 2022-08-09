import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as Joi from 'joi';
import * as path from 'path';
import mkdirp from 'mkdirp';

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
import {
  NoOpRequestJsonLogger,
  REQUEST_JSON_LOGGER,
} from './misc/request-json-logger';
import { RequestJsonFileLogger } from './misc/request-json-file-logger';
import { OrderMapper } from './api-extension/mappers/order';
import { ProductMapper } from './api-extension/mappers/product';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        APP_URL: Joi.string(),
        VOUCHERIFY_APP_ID: Joi.string().required(),
        VOUCHERIFY_SECRET_KEY: Joi.string().required(),
        VOUCHERIFY_API_URL: Joi.string().required(),
        COMMERCE_TOOLS_PROJECT_KEY: Joi.string().required(),
        COMMERCE_TOOLS_AUTH_URL: Joi.string().required(),
        COMMERCE_TOOLS_API_URL: Joi.string().required(),
        COMMERCE_TOOLS_ID: Joi.string().required(),
        COMMERCE_TOOLS_SECRET: Joi.string().required(),
        COMMERCE_TOOLS_PRODUCTS_CURRENCY: Joi.string().required(),
        COMMERCE_TOOLS_PRODUCTS_COUNTRY: Joi.string().optional(),
        COMMERCE_TOOLS_PRODUCT_CHANNEL: Joi.string().optional(),
        COMMERCE_TOOLS_PRODUCT_CUSTOMER_GROUP: Joi.string().optional(),
        COMMERCE_TOOLS_API_EXTENSION_KEY: Joi.string()
          .optional()
          .default('VOUCHERIFY_INTEGRATION'),
      }),
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
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        enableDebugMessages: true,
      }),
    },
    {
      provide: REQUEST_JSON_LOGGER,
      useFactory: async () => {
        if (process.env.DEBUG_STORE_REQUESTS_IN_JSON !== 'true') {
          return new NoOpRequestJsonLogger();
        }

        const requestsDir = process.env.DEBUG_STORE_REQUESTS_DIR;
        if (!requestsDir) {
          throw new Error(
            'Please provide value of DEBUG_STORE_REQUESTS_DIR env variable!',
          );
        }
        await mkdirp(path.join(process.cwd(), requestsDir));
        return new RequestJsonFileLogger(requestsDir);
      },
    },
  ],
})
export class AppModule {}
