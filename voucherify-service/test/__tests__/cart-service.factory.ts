import { Test } from '@nestjs/testing';
import { IntegrationService } from '../../src/integration/integration.service';
import { CustomTypesService } from '../../src/commercetools/custom-types/custom-types.service';
import { TaxCategoriesService } from '../../src/commercetools/tax-categories/tax-categories.service';
import { VoucherifyConnectorService } from '../../src/voucherify/voucherify-connector.service';
import { CommercetoolsConnectorService } from '../../src/commercetools/commercetools-connector.service';
import { ConfigService } from '@nestjs/config';

import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { CommercetoolsService } from '../../src/commercetools/commercetools.service';
import { VoucherifyService } from '../../src/voucherify/voucherify.service';

const moduleMocker = new ModuleMocker(global);

export type BuildCartServiceWithMockedDependenciesProps = {
  typesService: CustomTypesService;
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
  const baseProviders = [
    CommercetoolsService,
    VoucherifyService,
    IntegrationService,
    {
      provide: TaxCategoriesService,
      useValue: taxCategoriesService,
    },
    {
      provide: CustomTypesService,
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
  ];
  const module = await Test.createTestingModule({
    controllers: [],
    providers: configService
      ? [
          ...baseProviders,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ]
      : [...baseProviders, ConfigService],
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
  const taxCategoriesService_ =
    module.get<TaxCategoriesService>(TaxCategoriesService);
  const commerceToolsConnectorService_ =
    module.get<CommercetoolsConnectorService>(CommercetoolsConnectorService);

  return {
    commercetoolsService,
    taxCategoriesService: taxCategoriesService_,
    commerceToolsConnectorService: commerceToolsConnectorService_,
  };
}
