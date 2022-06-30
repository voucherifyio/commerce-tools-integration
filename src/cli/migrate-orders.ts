import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import events = require('events');

import { OrderImportService } from '../import/order-import.service';

async function run() {
  events.EventEmitter.defaultMaxListeners = 13;
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);
  const orderImportService = app.get(OrderImportService);

  const period = parseInt(
    process.argv.find((arg) => arg.includes('period'))?.match(/[0-9]{1,}/g)[0],
  );

  logger.log(`Attempt to migrate orders`);
  const result = await orderImportService.migrateOrders(period);
  if (result.success) {
    logger.log('Orders successfully migrated');
  } else {
    logger.log('Could not migrate orders');
  }
}

run();
