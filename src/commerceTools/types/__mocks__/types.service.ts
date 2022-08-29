import { Type } from '@commercetools/platform-sdk';
import { TypesService } from '../types.service';

interface MockedTypesService extends TypesService {
  __simulateDefaultFindCouponType: () => void;
  __simulateCouponTypeIsNotDefined: () => void;
}

export const defaultTypeId = '5aa76235-9d61-41c7-9d57-278b2bcc2f75';

const defaultGetTypeResponse = {
  id: defaultTypeId,
  version: 1,
  createdAt: '2022-07-06T10:31:15.002Z',
  lastModifiedAt: '2022-07-06T10:31:15.002Z',
  key: 'couponCodes',
  name: {
    en: 'couponCodes',
  },
  description: {
    en: 'couponCodes',
  },
  resourceTypeIds: ['order'],
  fieldDefinitions: [
    {
      name: 'discount_codes',
      label: {
        en: 'discount_codes',
      },
      required: false,
      type: {
        name: 'Set',
        elementType: {
          name: 'String',
        },
      },
      inputHint: 'SingleLine',
    },
    {
      name: 'used_codes',
      label: {
        en: 'used_codes',
      },
      required: false,
      type: {
        name: 'Set',
        elementType: {
          name: 'String',
        },
      },
      inputHint: 'SingleLine',
    },
    {
      name: 'session',
      label: {
        en: 'session',
      },
      required: false,
      type: {
        name: 'String',
      },
      inputHint: 'SingleLine',
    },
    {
      name: 'freeShipping',
      label: {
        en: 'freeShipping',
      },
      required: false,
      type: {
        name: 'Set',
        elementType: { name: 'String' },
      },
      inputHint: 'SingleLine',
    },
  ],
} as Type;

const typesService = jest.createMockFromModule(
  '../types.service',
) as MockedTypesService;

typesService.__simulateDefaultFindCouponType = () => {
  typesService.findCouponType = jest.fn(() =>
    Promise.resolve(defaultGetTypeResponse),
  );
};

typesService.__simulateCouponTypeIsNotDefined = () => {
  typesService.findCouponType = jest.fn(() => Promise.resolve(null));
};

typesService.__simulateDefaultFindCouponType();

export { typesService as TypesService, MockedTypesService };
