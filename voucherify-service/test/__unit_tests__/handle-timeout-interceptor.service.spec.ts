import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CommercetoolsService } from '../../src/commercetools/commercetools.service';
import { getCommerceToolsServiceMockWithMockedResponse } from '../__mocks__/commercetools.service';
import { cart } from './payloads/api-extension.controller.spec.payloads';
import { HandleTimeoutInterceptor } from '../../src/commercetools/handle-timeout-interceptor.service';

describe('CommerceToolsController', () => {
  let interceptor: HandleTimeoutInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleTimeoutInterceptor,
        Logger,
        {
          provide: CommercetoolsService,
          useValue: getCommerceToolsServiceMockWithMockedResponse(),
        },
      ],
    }).compile();

    interceptor = module.get<HandleTimeoutInterceptor>(
      HandleTimeoutInterceptor,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should intercept with cart payload with no errors', async () => {
    const next = {
      handle: jest
        .fn()
        .mockReturnValue({ pipe: jest.fn().mockReturnValue(undefined) }),
    };

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ body: cart }),
      }),
    };

    expect(await interceptor.intercept(context as any, next as any)).toEqual(
      undefined,
    );
  });

  it('should intercept with order payload with no errors', async () => {
    const next = {
      handle: jest
        .fn()
        .mockReturnValue({ pipe: jest.fn().mockReturnValue(undefined) }),
    };

    const order = { ...cart };
    order.resource.typeId = 'order';

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ body: order }),
      }),
    };

    const result = await interceptor.intercept(context as any, next as any);
    expect(result?.pipe).toBeDefined();
  });
});
