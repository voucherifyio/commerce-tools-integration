import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ApiExtensionController } from '../commercetools/api-extension.controller';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { getCommerceToolsServiceMockWithEmptyProductResponse } from '../commercetools/__mocks__/commercetools.service';
import { cart } from './payloads/api-extension.controller.spec.payloads';

describe('CommerceToolsController', () => {
  let controller: ApiExtensionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiExtensionController,
        Logger,
        {
          provide: CommercetoolsService,
          useValue: getCommerceToolsServiceMockWithEmptyProductResponse(),
        },
      ],
    }).compile();

    controller = module.get<ApiExtensionController>(ApiExtensionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handleApiExtensionRequest with cart payload with no errors', async () => {
    const responseExpress = {
      status: jest
        .fn()
        .mockReturnValue({ json: jest.fn().mockReturnValue(undefined) }),
    };

    expect(
      await controller.handleApiExtensionRequest(
        cart as any,
        responseExpress as any,
      ),
    ).toEqual(undefined);
  });

  it('should handleApiExtensionRequest with order payload with no errors', async () => {
    const responseExpress = {
      status: jest
        .fn()
        .mockReturnValue({ json: jest.fn().mockReturnValue(undefined) }),
    };
    const order = { ...cart };
    order.resource.typeId = 'order';

    expect(
      await controller.handleApiExtensionRequest(
        order as any,
        responseExpress as any,
      ),
    ).toEqual(undefined);
  });
});
