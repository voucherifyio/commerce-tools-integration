import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { CommercetoolsService } from '../../commercetools.service';
import { TypesService } from '../../types.service';
import { TaxCategoriesService } from '../../tax-categories.service'
import { IntegrationService } from '../../../../integration.service'
import { CommerceToolsConnectorService } from '../../commerce-tools-connector.service'
import { VoucherifyConnectorService } from '../../../../voucherify.service'


const moduleMocker = new ModuleMocker(global);
export type BuildCommercettoolsServiceWithMockedDependenciesProps = {
  typesService: TypesService;
  taxCategoriesService?: TaxCategoriesService
  voucherifyConnectorService?: VoucherifyConnectorService,
  commerceToolsConnectorService?: CommerceToolsConnectorService
};



export async function buildIntegrationServiceWithMockedDependencies({typesService, taxCategoriesService, voucherifyConnectorService, commerceToolsConnectorService}:BuildCommercettoolsServiceWithMockedDependenciesProps) {
  const module = await Test.createTestingModule({
    controllers: [],
    providers: [
      CommercetoolsService,
      IntegrationService,
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
        useValue: voucherifyConnectorService,
      },
      {
        provide: CommerceToolsConnectorService,
        useValue: commerceToolsConnectorService,
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
  const integrationService = module.get<IntegrationService>(IntegrationService);
  
  

  return { commerceToolsService, integrationService };
}
