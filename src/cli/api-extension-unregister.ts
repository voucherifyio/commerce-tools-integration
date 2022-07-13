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
  logger.log(
    `Attempt to unregister commerce tool api extension for ur: ${url}`,
  );
  await registerService
    .unregister()
    .then(() => {
      logger.log('Api extension unregistered');
    })
    .catch((error) => {
      logger.error(`Could not unregister api extension error - ${error}`);
    });
}

run();
