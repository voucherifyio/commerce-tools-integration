import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TaxCategoriesService } from '../../src/commercetools/tax-categories/tax-categories.service';
import { CommercetoolsConnectorService } from '../../src/commercetools/commercetools-connector.service';
import { getCommerceToolsConnectorServiceMockWithProductResponse } from '../__mocks__/commerce-tools-connector.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { getCouponTaxCategoryAndUpdateItIfNeededResponse } from './payloads/tax-categories.payloads';

const moduleMocker = new ModuleMocker(global);

describe('VoucherifyConnectorService', () => {
  let service: TaxCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxCategoriesService,
        {
          provide: CommercetoolsConnectorService,
          useValue:
            getCommerceToolsConnectorServiceMockWithProductResponse({
              sku: 'SKU_ID',
              price: 10,
              id: 'PRODUCT_ID',
            }) || {},
        },
        Logger,
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

    service = module.get<TaxCategoriesService>(TaxCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get coupon tax category', async () => {
    const response = await service.getCouponTaxCategoryAndUpdateItIfNeeded(
      'US',
    );
    expect(response).toEqual(getCouponTaxCategoryAndUpdateItIfNeededResponse);
  });

  it('should get coupon tax category already configured', async () => {
    const response = await service.configureCouponTaxCategory();
    expect(response).toEqual(getCouponTaxCategoryAndUpdateItIfNeededResponse);
  });
});
