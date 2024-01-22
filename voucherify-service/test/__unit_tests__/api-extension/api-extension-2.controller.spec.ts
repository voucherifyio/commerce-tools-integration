import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ApiExtensionController } from '../../../src/commercetools/api-extension.controller';
import { CommercetoolsService } from '../../../src/commercetools/commercetools.service';
import { getCommerceToolsServiceMockWithMockedResponse } from '../../__mocks__/commercetools.service';
import { cart } from '../payloads/api-extension.controller.spec.payloads';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ApiExtensionController2', () => {
  it('should execute responseExpress with { actions: [] }', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiExtensionController,
        Logger,
        {
          provide: CommercetoolsService,
          useValue: getCommerceToolsServiceMockWithMockedResponse({
            actions: [],
          }),
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
    expect(json).toBeCalledWith({});
  });

  it('should execute responseExpress with { actions: [1, 23] }', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiExtensionController,
        Logger,
        {
          provide: CommercetoolsService,
          useValue: getCommerceToolsServiceMockWithMockedResponse({
            status: 200,
            actions: [1, 23],
          }),
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
    expect(json).toBeCalledWith({ actions: [1, 23] });
  });
});
