import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExtensionService } from './commercetools/api-extension.service';
import * as ngrok from 'ngrok';
import { join } from 'path';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';

async function bootstrap() {
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('V%-CT'),
  );
  const logger = WinstonModule.createLogger({
    level: 'debug',
    transports: [
      new winston.transports.Console({
        format: logFormat,
      }),
    ],
  });
  logger.log('Launching ngrok service');
  const customNgrokBinPath = process.env.CUSTOM_NGROK_BIN_PATH;
  const port = process.env.PORT || 3000;
  const url = await ngrok.connect({
    addr: port,
    binPath: customNgrokBinPath ? () => join(customNgrokBinPath) : undefined,
  });
  logger.log(`Application available ${url}`);
  const app = await NestFactory.create(AppModule, { logger });
  await app.listen(port);
  logger.log(`Application port - ${port}`);
  const registerService = app.get(ApiExtensionService);
  const isApiExtensionRegistered = await registerService.update(url);
  if (isApiExtensionRegistered) {
    logger.log('Api Extension registered in Commerce tools');
  } else {
    logger.error('Could not register Api Extension in Commerce Tools');
  }
}

bootstrap();
