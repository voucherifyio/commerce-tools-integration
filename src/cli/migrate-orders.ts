import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import events = require('events');
import { parseTimeInput } from '../misc/time-parametr-parser';

import { OrderImportService } from '../import/order-import.service';

async function run() {
  events.EventEmitter.defaultMaxListeners = 13;
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);
  const orderImportService = app.get(OrderImportService);

  const time = parseTimeInput(process.argv);

  logger.log(`Attempt to migrate orders`);
  const result = await orderImportService.migrateOrders(time);
  if (result.success) {
    logger.log('Orders successfully migrated');
  } else {
    logger.log('Could not migrate orders');
  }
}

run();
