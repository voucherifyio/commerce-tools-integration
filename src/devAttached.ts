import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonLoggerService } from 'json-logger-service';
import { RegisterService as RegisterApiEstension } from './api-extension/register.service';
import * as ngrok from 'ngrok';

async function bootstrap() {
  const logger = new JsonLoggerService('NestServer');
  logger.log('Launching ngrok service');
  const url = await ngrok.connect(3000);
  logger.log(`Application available ${url}`);
  const app = await NestFactory.create(AppModule);
  app.useLogger(logger);
  await app.listen(3000);
  const registerService = app.get(RegisterApiEstension);
  const isApiExtensionRegistered = await registerService.register(url);
  if (isApiExtensionRegistered) {
    logger.log(`Api Extension registerd in Commerce tools`);
  } else {
    logger.error('Could not register Api Extension in Commerce Tools');
  }
}
bootstrap();
