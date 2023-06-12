import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import {
  createOrderItems,
  createOrderOrderCreateObject,
  createOrderOrderObject,
  getAvailablePromotionsCart,
  getAvailablePromotionsResponseObject,
  getAvailablePromotionsValidateWith,
  redeemStackableVouchersRequest,
  redeemStackableVouchersResponse,
} from './payloads/voucherify-connector.service.spec.paylaods';
import { OrderPaidActions } from '../commercetools/store-actions/order-paid-actions';

describe('VoucherifyConnectorService', () => {
  it('should check if releaseValidationSession was called 3 times', async () => {
    const orderPaidActions;
  });

  it('should check if validate was called 1 time, and items were mapped correctly', async () => {
    const validate = jest
      .fn()
      .mockResolvedValue(getAvailablePromotionsResponseObject);

    service.getClient = jest.fn().mockReturnValue({
      promotions: {
        validate,
      },
    });

    await service.getAvailablePromotions(getAvailablePromotionsCart);
    expect(validate).toBeCalledTimes(1);
    expect(validate).toBeCalledWith(
      expect.objectContaining(getAvailablePromotionsValidateWith),
    );
  });

  it('should check if list was called 1 time', async () => {
    const list = jest.fn().mockResolvedValue({ schemas: [] });

    service.getClient = jest.fn().mockReturnValue({
      metadataSchemas: {
        list,
      },
    });

    await service.getMetadataSchemaProperties('resourceName');
    expect(list).toBeCalledTimes(1);
  });

  it('should check if redeemStackable was called 1 time', async () => {
    const redeemStackable = jest
      .fn()
      .mockResolvedValue(redeemStackableVouchersResponse);

    service.getClient = jest.fn().mockReturnValue({
      redemptions: {
        redeemStackable,
      },
    });

    await service.redeemStackableVouchers(
      redeemStackableVouchersRequest as any,
    );
    expect(redeemStackable).toBeCalledTimes(1);
  });

  it('should check if orders.create was called 1 time, check if order mapping is correct', async () => {
    const create = jest.fn().mockResolvedValue(undefined);

    service.getClient = jest.fn().mockReturnValue({
      orders: {
        create,
      },
    });

    await service.createOrder(
      createOrderOrderObject as any,
      createOrderItems as any,
      {},
    );
    expect(create).toBeCalledTimes(1);
    expect(create).toBeCalledWith(createOrderOrderCreateObject);
  });
});
