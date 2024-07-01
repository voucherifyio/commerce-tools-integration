import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const logFormat =
    process.env.NODE_ENV === 'production'
      ? winston.format.combine(
          winston.format.json(),
          winston.format.timestamp(),
          winston.format.ms(),
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('V%-CT'),
        );

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'debug',
      transports: [
        new winston.transports.Console({
          format: logFormat,
        }),
      ],
    }),
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
