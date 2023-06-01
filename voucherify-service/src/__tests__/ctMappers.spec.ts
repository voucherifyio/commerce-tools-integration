import {
  getSimpleMetadataForOrderAllMetadataSchemaProperties,
  getSimpleMetadataForOrderRawOrder,
} from './payloads/ctMappers.spec.payloads';
import { getSimpleMetadataForOrder } from '../commercetools/utils/mappers/getSimpleMetadataForOrder';

describe('Integration Mappers Test', () => {
  it('should map getSimpleMetadataForOrder correctly', () => {
    const result = getSimpleMetadataForOrder(
      getSimpleMetadataForOrderRawOrder as any,
      getSimpleMetadataForOrderAllMetadataSchemaProperties,
    );
    expect(result).toEqual({
      billingAddress: {
        city: 'Kraków',
        country: 'DE',
        email: 'piotrzielinski96@yahoo.com',
        firstName: 'Piotr',
        lastName: 'Zieliński',
        phone: '+48796120506',
        postalCode: '31-543',
        streetName: 'Porcelanowa',
      },
    });
  });
});
