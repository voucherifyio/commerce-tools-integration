import { Type } from '@commercetools/platform-sdk';
import { CustomTypesService } from '../../src/commercetools/custom-types/custom-types.service';

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

export const getTypesServiceMockWithConfiguredCouponTypeResponse = () => {
  const typesService = jest.createMockFromModule(
    '../../src/commercetools/custom-types/custom-types.service',
  ) as CustomTypesService;

  typesService.findCouponType = jest
    .fn()
    .mockResolvedValue(defaultGetTypeResponse);

  return typesService;
};

export const getTypesServiceMockWithNotDefinedCouponTypeResponse = () => {
  const typesService = jest.createMockFromModule(
    '../../src/commercetools/custom-types/custom-types.service',
  ) as CustomTypesService;

  typesService.findCouponType = jest
    .fn()
    .mockRejectedValue(new Error('CouponType not found'));

  return typesService;
};
