import { getCommercetoolstCurrentPriceAmount } from '../../src/commercetools/utils/getCommercetoolstCurrentPriceAmount';
import {
  deserializeCouponsSerializedDiscountOrCode,
  getCommercetoolstCurrentPriceAmountCtProduct,
  getCommercetoolstCurrentPriceAmountProductPriceSelector,
  getCommercetoolstCurrentPriceAmountProductSkuSourceId,
  getCommercetoolstCurrentPriceAmountResult,
} from './payloads/ctUtils.spec.payloads';
import { deserializeCoupons } from '../../src/commercetools/utils/deserializeCoupons';

describe('CT Utils Test', () => {
  it('should getCommercetoolstCurrentPriceAmount correctly', () => {
    const result = getCommercetoolstCurrentPriceAmount(
      getCommercetoolstCurrentPriceAmountCtProduct as any,
      getCommercetoolstCurrentPriceAmountProductSkuSourceId,
      getCommercetoolstCurrentPriceAmountProductPriceSelector,
    );
    expect(result).toEqual(getCommercetoolstCurrentPriceAmountResult);
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
