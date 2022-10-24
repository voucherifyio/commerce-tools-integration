import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { CommercetoolsService } from '../../commercetools.service';
import { TypesService } from '../../types.service';
import { TaxCategoriesService } from '../../tax-categories.service'

const moduleMocker = new ModuleMocker(global);
export type BuildCommercettoolsServiceWithMockedDependenciesProps = {
  typesService: TypesService;
  taxCategoriesService?: TaxCategoriesService
};



export async function buildCommercetoolsServiceWithMockedDependencies({typesService, taxCategoriesService}:BuildCommercettoolsServiceWithMockedDependenciesProps) {
  const module = await Test.createTestingModule({
    controllers: [],
    providers: [
      CommercetoolsService,
      {
        provide: TypesService,
        useValue: typesService,
      },
      {
        provide: TaxCategoriesService,
        useValue: taxCategoriesService,
      }
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
  const commerceToolsService = module.get<CommercetoolsService>(CommercetoolsService);
  const cartHandlerMock = jest.fn()
  commerceToolsService.onCartUpdate(cartHandlerMock)
  

  return { commerceToolsService, cartHandlerMock };
}
