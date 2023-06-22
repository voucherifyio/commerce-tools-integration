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
            execute: jest
              .fn()
              .mockResolvedValue({ body: { payments: 'found' } }),
          }),
        }),
      }),
    };
    orderPaidActions.setCtClient(ctClient as any);
    expect(await orderPaidActions.findPayment('any')).toEqual({
      payments: 'found',
    });
  });

  it('should getCustomMetadataForOrder correctly', async () => {
    const orderPaidActions = new OrderPaidActions();
    const ctClient = {
      payments: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest
              .fn()
              .mockResolvedValue({ body: { payments: 'found', id: 123 } }),
          }),
        }),
      }),
    };
    orderPaidActions.setCtClient(ctClient as any);
    const result = await orderPaidActions.getCustomMetadataForOrder(
      order as any,
      orderMetadataSchemaProperties,
    );

    expect(result).toEqual({
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 33636,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 37000,
          fractionDigits: 2,
        },
        taxPortions: [
          {
            rate: 0.1,
            amount: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 3364,
              fractionDigits: 2,
            },
            name: '10% incl.',
          },
        ],
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 3364,
          fractionDigits: 2,
        },
      },
    });
    const result2 = await orderPaidActions.getCustomMetadataForOrder(
      order as any,
      [...orderMetadataSchemaProperties, 'payments'],
    );
    expect(result2).toEqual({
      payments: [
        {
          id: 123,
          payments: 'found',
        },
      ],
      taxedPrice: {
        totalNet: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 33636,
          fractionDigits: 2,
        },
        totalGross: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 37000,
          fractionDigits: 2,
        },
        taxPortions: [
          {
            rate: 0.1,
            amount: {
              type: 'centPrecision',
              currencyCode: 'USD',
              centAmount: 3364,
              fractionDigits: 2,
            },
            name: '10% incl.',
          },
        ],
        totalTax: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 3364,
          fractionDigits: 2,
        },
      },
    });
  });
});
