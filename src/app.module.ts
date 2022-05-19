import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { VoucherifyConnectorService } from './voucherify/voucherify-connector.service';
import { CommerceToolsConnectorService } from './commerceTools/commerce-tools-connector.service';
import { ApiExtensionController } from './api-extension/api-extension.controller';
import { ApiExtensionService } from './api-extension/api-extension.service';
import { RegisterService } from './api-extension/register.service';
import { ConfigModule } from '@nestjs/config';
import { TaxCategoriesService } from './commerceTools/tax-categories/tax-categories.service';
import { TaxCategoriesController } from './commerceTools/tax-categories/tax-categories.controller';
import { TypesController } from './commerceTools/types/types.controller';
import { TypesService } from './commerceTools/types/types.service';
import { ProductsService } from './commerceTools/products/products.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        APP_URL: Joi.string(),
        VOUCHERIFY_APP_ID: Joi.string().required(),
        VOUCHERIFY_SECRET_KEY: Joi.string().required(),
        COMMERCE_TOOLS_PROJECT_KEY: Joi.string().required(),
        COMMERCE_TOOLS_AUTH_URL: Joi.string().required(),
        COMMERCE_TOOLS_API_URL: Joi.string().required(),
        COMMERCE_TOOLS_ID: Joi.string().required(),
        COMMERCE_TOOLS_SECRET: Joi.string().required(),
      }),
    }),
  ],
  controllers: [
    AppController,
    ApiExtensionController,
    TaxCategoriesController,
    TypesController,
  ],
  providers: [
    AppService,
    ApiExtensionService,
    RegisterService,
    VoucherifyConnectorService,
    CommerceToolsConnectorService,
    TaxCategoriesService,
    TypesService,
    ProductsService,
  ],
})
export class AppModule {}
