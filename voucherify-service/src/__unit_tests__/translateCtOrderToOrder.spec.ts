import { translateCtOrderToOrder } from '../commercetools/utils/mappers/translateCtOrderToOrder';
import { ctOrder, order } from './payloads/translateCtOrderToOrder';

describe('translateCtOrderToOrder Test', () => {
  it('should map translateCtOrderToOrder correctly', () => {
    const result = translateCtOrderToOrder(ctOrder as any);
    expect(result).toEqual(order);
  });
});
