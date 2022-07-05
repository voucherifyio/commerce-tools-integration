import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonLoggerService } from 'json-logger-service';
import { RegisterService as RegisterApiEstension } from './api-extension/register.service';
import * as ngrok from 'ngrok';
import { join } from 'path';

async function bootstrap() {
  const logger = new JsonLoggerService('NestServer');
  logger.log('Launching ngrok service');
  const customNgrokBinPath = process.env.CUSTOM_NGROK_BIN_PATH;
  const port = process.env.PORT || 3000;
  const url = await ngrok.connect({
    addr: port,
    binPath: customNgrokBinPath
      ? () => join(`${customNgrokBinPath}`)
      : undefined,
  });
  logger.log(`Application available ${url}`);
  const app = await NestFactory.create(AppModule);
  app.useLogger(logger);
  await app.listen(port);
  logger.log(`Application port - ${port}`);
  const registerService = app.get(RegisterApiEstension);
  const isApiExtensionRegistered = await registerService.register(url);
  if (isApiExtensionRegistered) {
    logger.log({ msg: `Api Extension registerd in Commerce tools` });
  } else {
    logger.error({ msg: 'Could not register Api Extension in Commerce Tools' });
  }
}
bootstrap();
