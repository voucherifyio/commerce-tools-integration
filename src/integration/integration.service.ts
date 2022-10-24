import { Injectable } from '@nestjs/common';
import { CommercetoolsService } from './store/commercetools/commercetools.service';
@Injectable()
export class IntegrationService {
  constructor(private store: CommercetoolsService) {
    store.onCartUpdate((cartActions) => {
      return Promise.resolve(true);
    });
  }
}
