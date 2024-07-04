import { TypeDraft } from '@commercetools/platform-sdk';

export const LINE_ITEM_COUPON_CUSTOM_FIELDS: TypeDraft = {
  key: 'lineItemCodesType', //DO NOT CHANGE the key
  name: {
    en: 'lineItemCodesType',
  },
  description: {
    en: 'lineItemCodesType',
  },
  resourceTypeIds: ['line-item'],
  fieldDefinitions: [
    {
      name: 'applied_codes',
      label: {
        en: 'applied_codes',
      },
      required: false,
      type: {
        name: 'Set',
        elementType: { name: 'String' },
      },
      inputHint: 'SingleLine',
    },
    {
      name: 'coupon_fixed_price',
      label: {
        en: 'coupon_fixed_price',
      },
      required: false,
      type: {
        name: 'Number',
      },
      inputHint: 'SingleLine',
    },
  ],
};

export const ORDER_COUPON_CUSTOM_FIELDS: TypeDraft = {
  key: 'couponCodes', //DO NOT CHANGE the key
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
        elementType: { name: 'String' },
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
        elementType: { name: 'String' },
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
      name: 'shippingProductSourceIds',
      label: {
        en: 'shippingProductSourceIds',
      },
      required: false,
      type: {
        name: 'Set',
        elementType: { name: 'String' },
      },
      inputHint: 'SingleLine',
    },
    {
      name: 'couponsLimit',
      label: {
        en: 'couponsLimit',
      },
      required: false,
      type: {
        name: 'Number',
      },
      inputHint: 'SingleLine',
    },
  ],
};
