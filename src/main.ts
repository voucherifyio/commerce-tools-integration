import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonLoggerService } from 'json-logger-service';
import events = require('events');

async function bootstrap() {
  events.EventEmitter.defaultMaxListeners = 13;
  const app = await NestFactory.create(AppModule);
  app.useLogger(new JsonLoggerService('NestServer'));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
