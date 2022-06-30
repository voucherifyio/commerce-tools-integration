import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import events = require('events');

import { ProductImportService } from '../import/product-import.service';

async function run() {
  events.EventEmitter.defaultMaxListeners = 13;
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);
  const productImportService = app.get(ProductImportService);

  const period = parseInt(
    process.argv.find((arg) => arg.includes('period'))?.match(/[0-9]{1,}/g)[0],
  );

  logger.log(`Attempt to migrate products`);
  const result = await productImportService.migrateProducts(period);
  if (result.success) {
    logger.log('Products successfully migrated');
  } else {
    logger.log('Could not migrate products');
  }
}

run();
