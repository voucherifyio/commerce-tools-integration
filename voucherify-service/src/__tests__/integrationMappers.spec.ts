import { OrderMapper } from '../integration/utils/mappers/order';
import {
  getOrderObjectOrder,
  getOrderObjectResponse,
} from './payloads/integrationMappers.spec.payloads';

describe('SleepTest', () => {
  it('should be defined', async () => {
    const orderMapper = new OrderMapper();
    const result = orderMapper.getOrderObject(getOrderObjectOrder as any);
    expect(result).toEqual(getOrderObjectResponse);
  });
});
