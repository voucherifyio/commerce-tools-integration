import {
  getOrderObjectOrder,
  getOrderObjectResponse,
  buildRedeemStackableRequestForVoucherifyItems,
  buildRedeemStackableRequestForVoucherifyOrder,
  buildRedeemStackableRequestForVoucherifyResponse,
} from './payloads/integrationMappers.spec.payloads';
import { buildRedeemStackableRequestForVoucherify } from '../../src/integration/utils/mappers/buildRedeemStackableRequestForVoucherify';
import { OrderMapper } from '../../src/integration/utils/mappers/order';

describe('Integration Mappers Test', () => {
  it('Should map order correctly', () => {
    const orderMapper = new OrderMapper();
    const result = orderMapper.getOrderObject(getOrderObjectOrder as any);
    expect(result).toEqual(getOrderObjectResponse);
  });

  it('should map order with items to V% redeem', async () => {
    const result = buildRedeemStackableRequestForVoucherify(
      buildRedeemStackableRequestForVoucherifyOrder as any,
      buildRedeemStackableRequestForVoucherifyItems as any,
      {},
    );
    expect(result).toEqual(buildRedeemStackableRequestForVoucherifyResponse);
  });
});
