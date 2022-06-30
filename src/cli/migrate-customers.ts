import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import events = require('events');

import { CustomerImportService } from '../import/customer-import.service';

async function run() {
  events.EventEmitter.defaultMaxListeners = 13;
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);
  const customerImportService = app.get(CustomerImportService);

  const period = parseInt(
    process.argv.find((arg) => arg.includes('period'))?.match(/[0-9]{1,}/g)[0],
  );

  logger.log(`Attempt to migrate customers`);
  const result = await customerImportService.migrateCustomers(period);
  if (result.success) {
    logger.log('Customers successfully migrated');
  } else {
    logger.log('Could not migrate customers');
  }
}

run();
