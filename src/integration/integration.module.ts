import { Module, Logger } from '@nestjs/common';
import { CommercetoolsService } from './store/commercetools/commercetools.service';
import { CommercetoolsController } from './store/commercetools/commercetools.controller';
import { VoucherifyConnectorService } from './voucherify.service';
import { IntegrationService } from './integration.service';

@Module({
  controllers: [CommercetoolsController],
  providers: [
    CommercetoolsService,
    VoucherifyConnectorService,
    IntegrationService,
    Logger,
  ],
})
export class IntegrationModule {}
