import { Test } from '@nestjs/testing';
import { Type, TaxCategory } from '@commercetools/platform-sdk';

import { CartService } from '../cart.service';
import { TypesService } from '../../commerceTools/types/types.service';
import { TaxCategoriesService } from '../../commerceTools/tax-categories/tax-categories.service';
import { VoucherifyConnectorService } from '../../voucherify/voucherify-connector.service';
import { CommerceToolsConnectorService } from '../../commerceTools/commerce-tools-connector.service';
import { ProductMapper } from '../mappers/product';

import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

export type BuildCartServiceWithMockedDependenciesProps = {
  typesService: TypesService;
  taxCategoriesService: TaxCategoriesService;
  voucherifyConnectorService?: VoucherifyConnectorService;
  commerceToolsConnectorService?: CommerceToolsConnectorService;
};

export async function buildCartServiceWithMockedDependencies({
  typesService,
  taxCategoriesService,
  voucherifyConnectorService,
  commerceToolsConnectorService,
}: BuildCartServiceWithMockedDependenciesProps) {
  const module = await Test.createTestingModule({
    controllers: [],
    providers: [
      CartService,
      ProductMapper,
      {
        provide: TypesService,
        useValue: typesService,
      },
      {
        provide: TaxCategoriesService,
        useValue: taxCategoriesService,
      },
      {
        provide: VoucherifyConnectorService,
        useValue: voucherifyConnectorService || {},
      },
      {
        provide: CommerceToolsConnectorService,
        useValue: commerceToolsConnectorService || {},
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
  const cartService = module.get<CartService>(CartService);
  const productMapper = module.get<ProductMapper>(ProductMapper);

  return { cartService, productMapper };
}
