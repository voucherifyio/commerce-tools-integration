import mapValidateCouponsResultToLineProductsWithFixedAmount from '../../src/commercetools/store-actions/cart-update-actions/helpers/fixedPrice';
import { dataToRunCartActionsBuilder } from './payloads/fixedPrice.spec.payloads';

describe('replaceCodesWithInapplicableCoupons', () => {
  it('should map code to result', async () => {
    expect(
      mapValidateCouponsResultToLineProductsWithFixedAmount(
        dataToRunCartActionsBuilder as any,
      ),
    ).toEqual([
      {
        action: 'setLineItemCustomType',
        lineItemId: '093db141-0a2b-472d-b520-556b8c7ac307',
        type: { key: 'lineItemCodesType' },
        fields: {},
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: '883ca605-dcb1-4f83-84e4-d75742bd38f8',
        type: { key: 'lineItemCodesType' },
        fields: {},
      },
      {
        action: 'setLineItemCustomType',
        lineItemId: '86a2607b-55cb-4ea6-8d00-3cc53c4a2c33',
        type: { key: 'lineItemCodesType' },
        fields: {
          coupon_fixed_price: 10000,
        },
      },
    ]);
  });
});
