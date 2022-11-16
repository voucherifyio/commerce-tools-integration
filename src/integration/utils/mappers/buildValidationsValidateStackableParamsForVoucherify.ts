import { Cart, Coupon } from '../../types';
import { ValidationsValidateStackableParams } from '@voucherify/sdk';

export function buildValidationsValidateStackableParamsForVoucherify(
  coupons: Coupon[],
  cart: Cart,
  items,
) {
  return {
    // options?: StackableOptions;
    redeemables: coupons.map((code) => {
      return {
        object: code.type ? code.type : 'voucher',
        id: code.code,
      };
    }),
    session: {
      type: 'LOCK',
      ...(cart.sessionKey && { key: cart.sessionKey }),
    },
    order: {
      source_id: cart.id,
      customer: {
        source_id: cart.customerId || cart.anonymousId,
      },
      amount: items.reduce((acc, item) => acc + item.amount, 0),
      discount_amount: 0,
      items,
    },
    customer: {
      source_id: cart.customerId || cart.anonymousId,
    },
  } as ValidationsValidateStackableParams;
}
