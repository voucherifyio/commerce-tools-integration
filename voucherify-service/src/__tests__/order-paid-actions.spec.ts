import { AppValidationPipe } from '../configs/appValidationPipe';
import { ValidationSchema } from '../configs/validationSchema';
import { OrderPaidActions } from '../commercetools/store-actions/order-paid-actions';
import {
  order,
  orderMetadataSchemaProperties,
} from './payloads/order-paid-actions-pailoads';

describe('OrderPaidActions', () => {
  it('Should find payments', async () => {
    const orderPaidActions = new OrderPaidActions();
    const ctClient = {
      payments: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      }),
    };
    orderPaidActions.setCtClient(ctClient as any);
    expect(await orderPaidActions.findPayment('any')).toBeUndefined();
  });

  it('should getCustomMetadataForOrder correctly', async () => {
    const orderPaidActions = new OrderPaidActions();
    const ctClient = {
      payments: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([{ id: 'test' }]),
          }),
        }),
      }),
    };
    orderPaidActions.setCtClient(ctClient as any);
    const result = await orderPaidActions.getCustomMetadataForOrder(
      order as any,
      orderMetadataSchemaProperties,
    );
    expect(result).toEqual({});
    const result2 = await orderPaidActions.getCustomMetadataForOrder(
      order as any,
      [...orderMetadataSchemaProperties, 'payments'],
    );
    expect(result2).toEqual({ payments: [] });
  });
});
