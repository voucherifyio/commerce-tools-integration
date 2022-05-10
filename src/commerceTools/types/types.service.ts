import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import { Type } from '@commercetools/platform-sdk';

@Injectable()
export class TypesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  async getAllTypes(): Promise<Type[]> {
    const CT = this.commerceToolsConnectorService.getClient();
    const types = await CT.types().get().execute();
    return types.body.results;
  }

  async configureCouponType() {
    const CT = this.commerceToolsConnectorService.getClient();

    return { success: false };
  }
}
