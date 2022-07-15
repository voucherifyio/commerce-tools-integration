import { Cart } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../types';
import { CartActionSetCustomFieldWithSession } from './CartAction';

export default function setSessionAsCustomField(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetCustomFieldWithSession[] {
  const { valid, newSessionKey } = validateCouponsResult;
  const sessionKey = cart.custom?.fields?.session ?? null;
  if (!valid || !newSessionKey || newSessionKey === sessionKey) {
    return [];
  }

  return [
    {
      action: 'setCustomField',
      name: 'session',
      value: newSessionKey,
    },
  ];
}
