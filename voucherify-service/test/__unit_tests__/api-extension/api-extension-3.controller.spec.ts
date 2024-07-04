import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ApiExtensionController } from '../../../src/commercetools/api-extension.controller';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { cart } from '../payloads/api-extension.controller.spec.payloads';

describe('ApiExtensionController', () => {
  it('should execute responseExpress with { actions: [] } after an error occurs', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiExtensionController,
        Logger,
        {
          provide: CommercetoolsService,
          useValue: {},
        },
      ],
    }).compile();

    const controller = module.get<ApiExtensionController>(
      ApiExtensionController,
    );

    const json = jest.fn().mockReturnValue(undefined);

    const responseExpress = {
      status: jest.fn().mockReturnValue({ json }),
    };

    await controller.handleApiExtensionRequest(
      cart as any,
      responseExpress as any,
    );
    expect(json).toBeCalledWith({ actions: [] });
  });
});
