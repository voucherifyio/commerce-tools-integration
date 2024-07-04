import { getCommercetoolsCurrentPriceAmount } from '../../src/commercetools/utils/getCommercetoolsCurrentPriceAmount';
import {
  deserializeCouponsSerializedDiscountOrCode,
  getCommercetoolsCurrentPriceAmountCtProduct,
  getCommercetoolsCurrentPriceAmountProductPriceSelector,
  getCommercetoolsCurrentPriceAmountProductSkuSourceId,
  getCommercetoolsCurrentPriceAmountResult,
} from './payloads/ctUtils.spec.payloads';
import { deserializeCoupons } from '../../src/commercetools/utils/deserializeCoupons';

describe('CT Utils Test', () => {
  it('should getCommercetoolsCurrentPriceAmount correctly', () => {
    const result = getCommercetoolsCurrentPriceAmount(
      getCommercetoolsCurrentPriceAmountCtProduct as any,
      getCommercetoolsCurrentPriceAmountProductSkuSourceId,
      getCommercetoolsCurrentPriceAmountProductPriceSelector,
    );
    expect(result).toEqual(getCommercetoolsCurrentPriceAmountResult);
  });

  it('should deserializeCoupons correctly', () => {
    expect(
      deserializeCoupons(deserializeCouponsSerializedDiscountOrCode),
    ).toEqual({
      code: 'unit1',
      status: 'APPLIED',
      type: 'voucher',
      value: 37375,
    });

    expect(deserializeCoupons('test')).toEqual({
      code: 'test',
      status: 'NEW',
    });
  });
});
