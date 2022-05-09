import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { TmpVoucherifyConnectorController } from './commerceTools/tmp-voucherify-connector.controller';
import { VoucherifyConnectorService } from './commerceTools/voucherify-connector.service';
import { TmpCtConnectorController } from './commerceTools/tmp-ct-connector.controller';
import { CommerceToolsConnectorService } from './commerceTools/commerce-tools-connector.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, TmpVoucherifyConnectorController, TmpCtConnectorController],
  providers: [AppService, VoucherifyConnectorService, CommerceToolsConnectorService],
})
export class AppModule {}
