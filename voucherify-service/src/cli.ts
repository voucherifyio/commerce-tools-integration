import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

async function bootstrap() {
  await CommandFactory.run(
    AppModule,
    WinstonModule.createLogger({
      level: 'error',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('V%-CT'),
          ),
        }),
      ],
    }),
  );
}

bootstrap();
