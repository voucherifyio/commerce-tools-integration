import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiExtensionController } from './api-extension/api-extension.controller';
import { ApiExtensionService } from './api-extension/api-extension.service';

@Module({
  imports: [],
  controllers: [AppController, ApiExtensionController],
  providers: [AppService, ApiExtensionService],
})
export class AppModule {}
