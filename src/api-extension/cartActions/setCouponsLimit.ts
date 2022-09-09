import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { CartActionSetCustomFieldWithCouponsLimit } from './CartAction';

export default function setCouponsLimit(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetCustomFieldWithCouponsLimit[] {
  return [
    {
      action: 'setCustomField',
      name: 'couponsLimit',
      value: +validateCouponsResult.couponsLimit,
    },
  ];
}
