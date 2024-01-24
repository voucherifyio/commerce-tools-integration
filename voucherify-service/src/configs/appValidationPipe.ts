import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

export const AppValidationPipe = {
  provide: APP_PIPE,
  useValue: new ValidationPipe({
    transform: true,
    enableDebugMessages: true,
  }),
};
