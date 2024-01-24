import {
  getSimpleMetadataForOrderAllMetadataSchemaProperties,
  getSimpleMetadataForOrderRawOrder,
} from './payloads/ctMappers.spec.payloads';
import { getSimpleMetadataForOrder } from '../../src/commercetools/utils/mappers/getSimpleMetadataForOrder';
import { mergeTwoObjectsIntoOne } from '../../src/integration/utils/mergeTwoObjectsIntoOne';
import {
  firstObject,
  secondObject,
} from './payloads/mergeTwoObjectsIntoOne.spec.payload';

describe('CT Mappers Test', () => {
  it('should map getSimpleMetadataForOrder correctly', () => {
    const result = getSimpleMetadataForOrder(
      getSimpleMetadataForOrderRawOrder as any,
      getSimpleMetadataForOrderAllMetadataSchemaProperties,
    );
    expect(result).toEqual({
      billingAddress: {
        city: 'Kraków',
        country: 'DE',
        email: 'piotrzielinski@gmail.com',
        firstName: 'Piotr',
        lastName: 'Zieliński',
        phone: '+48796120506',
        postalCode: '32-000',
        streetName: 'Porcelanowa',
      },
    });
  });

  it('should merge two objects into one correctly', () => {
    const result = mergeTwoObjectsIntoOne(firstObject, secondObject);
    expect(result).toEqual({
      id: '1f84a16d-00b2-42c3-9367-a7a31bf2ebce',
      version: '5',
      versionModifiedAt: '2023-05-31T16:04:06.867Z',
      createdAt: '2023-05-31T16:04:06.656Z',
      lastModifiedAt: '2023-05-31T16:04:06.867Z',
      name: 'coupon',
      firstName: 'Piotr',
      lastName: 'Zieliński',
      streetName: 'Porcelanowa',
      postalCode: '32-000',
      city: 'Kraków',
      country: 'DE',
      phone: '+48796120506',
      email: 'piotrzielinski@gmail.com',
    });
  });
});
