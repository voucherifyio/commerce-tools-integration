import { Test } from '@nestjs/testing';
import { CartService } from '../cart.service';
import { TypesService } from '../../commercetools/types/types.service';
import { TaxCategoriesService } from '../../commercetools/tax-categories/tax-categories.service';
import { VoucherifyConnectorService } from '../../voucherify/voucherify-connector.service';
import { CommercetoolsConnectorService } from '../../commercetools/commercetools-connector.service';
import { ProductMapper } from '../mappers/product';
import { ConfigService } from '@nestjs/config';

import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { CommercetoolsService } from '../../commercetools/commercetools.service';
import { ApiExtensionController } from '../../commercetools/api-extension.controller';

const moduleMocker = new ModuleMocker(global);

export type BuildCartServiceWithMockedDependenciesProps = {
  typesService: TypesService;
  taxCategoriesService: TaxCategoriesService;
  voucherifyConnectorService?: VoucherifyConnectorService;
  commerceToolsConnectorService?: CommercetoolsConnectorService;
  configService?: ConfigService;
};

export async function buildCartServiceWithMockedDependencies({
  typesService,
  taxCategoriesService,
  voucherifyConnectorService,
  commerceToolsConnectorService,
  configService,
}: BuildCartServiceWithMockedDependenciesProps) {
  const module = await Test.createTestingModule({
    controllers: [],
    providers: [
      CommercetoolsService,
      CartService,
      ProductMapper,
      {
        provide: TaxCategoriesService,
        useValue: taxCategoriesService,
      },
      {
        provide: TypesService,
        useValue: typesService,
      },
      {
        provide: VoucherifyConnectorService,
        useValue: voucherifyConnectorService || {},
      },
      {
        provide: CommercetoolsConnectorService,
        useValue: commerceToolsConnectorService || {},
      },
      {
        provide: ConfigService,
        useValue: configService,
      },
    ],
  })
    .useMocker((token) => {
      if (typeof token === 'function') {
        const mockMetadata = moduleMocker.getMetadata(
          token,
        ) as MockFunctionMetadata<any, any>;
        const Mock = moduleMocker.generateFromMetadata(mockMetadata);
        return new Mock();
      }
    })
    .compile();
  const commercetoolsService =
    module.get<CommercetoolsService>(CommercetoolsService);
  const productMapper = module.get<ProductMapper>(ProductMapper);
  const taxCategoriesService_ =
    module.get<TaxCategoriesService>(TaxCategoriesService);

  return {
    commercetoolsService,
    productMapper,
    taxCategoriesService: taxCategoriesService_,
  };
}
