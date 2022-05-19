import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JsonLoggerService } from 'json-logger-service';
import { ConfigService } from '@nestjs/config';

import { RegisterService } from '../api-extension/register.service';

async function run() {
  const logger = new JsonLoggerService('NestServer');
  const app = await NestFactory.createApplicationContext(AppModule);
  const registerService = app.get(RegisterService);
  const configService = app.get(ConfigService);
  const url = configService.get<string>('APP_URL');
  logger.log(`Attempt to register commerce tool api extension for ur: ${url}`);
  const result = await registerService.register(url);
  if (result) {
    logger.log('Api extension registered', result);
  } else {
    logger.error('Could not register api extension');
  }
}

run();
