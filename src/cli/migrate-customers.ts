import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import events = require('events');

import { CustomerImportService } from '../import/customer-import.service';
import { parseTimeInput } from '../misc/time-parametr-parser';

async function run() {
  events.EventEmitter.defaultMaxListeners = 13;
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);
  const customerImportService = app.get(CustomerImportService);

  const time = parseTimeInput(process.argv);

  logger.log(`Attempt to migrate customers`);
  const result = await customerImportService.migrateCustomers(time);
  if (result.success) {
    logger.log('Customers successfully migrated');
  } else {
    logger.log('Could not migrate customers');
  }
}

run();
