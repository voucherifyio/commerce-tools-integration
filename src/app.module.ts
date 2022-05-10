import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoucherifyConnectorService } from './commerceTools/voucherify-connector.service';
import { CommerceToolsConnectorService } from './commerceTools/commerce-tools-connector.service';
import { ApiExtensionController } from './api-extension/api-extension.controller';
import { ApiExtensionService } from './api-extension/api-extension.service';
import { ConfigModule } from '@nestjs/config';
import { TaxCategoriesService } from './commerceTools/tax-categories/tax-categories.service';
import { TaxCategoriesController } from './commerceTools/tax-categories/tax-categories.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, ApiExtensionController, TaxCategoriesController],
  providers: [
    AppService,
    ApiExtensionService,
    VoucherifyConnectorService,
    CommerceToolsConnectorService,
    TaxCategoriesService,
  ],
})
export class AppModule {}
