import { getOrderMetadata } from '../../src/integration/utils/getOrderMetadata';
import { cart } from './payloads/commercetools.service.spec.payloads';
import { OrderPaidActions } from '../../src/commercetools/store-actions/order-paid-actions';

describe('Get order metadata', () => {
  it('should getOrderMetadata correctly (while no custom function is provided)', async () => {
    const result = await getOrderMetadata(cart as any, [
      'country',
      'shippingMode',
      'type',
    ]);
    expect(result).toEqual({
      country: 'US',
      shippingMode: 'Single',
      type: 'Cart',
    });
  });

  it('should getOrderMetadata correctly (while orderPaidActions.getCustomMetadataForOrder function is provided)', async () => {
    const orderPaidActions = new OrderPaidActions();
    const result = await getOrderMetadata(
      cart as any,
      [
        'country',
        'shippingMode',
        'type',
        'custom_filed_discount_codes',
        'custom_filed_session',
      ],
      orderPaidActions.getCustomMetadataForOrder,
    );
    expect(result).toEqual({
      country: 'US',
      shippingMode: 'Single',
      type: 'Cart',
      custom_filed_discount_codes: [
        '{"code":"PERC10","status":"APPLIED","value":2650}',
        '{"code":"AMOUNT20","status":"APPLIED","value":2000}',
      ],
      custom_filed_session: 'existing-session-id',
    });
  });
});
