import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../commerceTools/types/types.service';
import { ProductImportService } from 'src/import/product-import.service';
import { OrderImportService } from 'src/import/order-import.service';

async function run() {
  console.log('process.argv', process.argv);
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);

  // Coupon types
  const typesService = app.get(TypesService);
  logger.log('Attempt to configure required coupon types in Commerce Tools');
  const { success: couponTypesCreated } =
    await typesService.configureCouponTypes();
  if (couponTypesCreated) {
    logger.log('Coupon types configured');
  } else {
    logger.error('Could not configure coupon codes');
  }

  // Tax categories
  const taxCategoriesService = app.get(TaxCategoriesService);
  logger.log('Attempt to configure coupon tax categories in Commerce Tools');
  const { success: couponTaxCategoriesCreated } =
    await taxCategoriesService.configureCouponTaxCategory();
  if (couponTaxCategoriesCreated) {
    logger.log('Coupon tax categories configured');
  } else {
    logger.error('Could not configure coupon tax categories');
  }

  // Product migration
  const productImportService = app.get(ProductImportService);
  logger.log('Attempt to migrate products from Commerce Tools to Voucherify');
  const { success: productsMigrated } =
    await productImportService.migrateProducts();
  if (productsMigrated) {
    logger.log('Products migrated');
  } else {
    logger.error('Could not migrate products');
  }

  // Order migration
  const orderImportService = app.get(OrderImportService);
  logger.log('Attempt to migrate orders from Commerce Tools to Voucherify');
  const { success: ordersMigrated } = await orderImportService.migrateOrders();
  if (ordersMigrated) {
    logger.log('Orders migrated');
  } else {
    logger.error('Could not migrate orders');
  }
}

run();
