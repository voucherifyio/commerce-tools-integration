import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import events = require('events');
import { parseTimeInput } from '../misc/time-parametr-parser';

import { ProductImportService } from '../import/product-import.service';

async function run() {
  events.EventEmitter.defaultMaxListeners = 13;
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);
  const productImportService = app.get(ProductImportService);

  const time = parseTimeInput(process.argv);

  logger.log(`Attempt to migrate products`);
  const result = await productImportService.migrateProducts(time);
  if (result.success) {
    logger.log('Products successfully migrated');
  } else {
    logger.log('Could not migrate products');
  }
}

run();
