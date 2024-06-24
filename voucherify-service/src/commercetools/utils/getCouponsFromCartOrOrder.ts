import { Cart as CommerceToolsCart } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/cart';
import { Order as CommerceToolsOrder } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { Coupon } from '../../integration/types';
import { deserializeCoupons } from './deserializeCoupons';
import { uniqBy } from 'lodash';

export function getCouponsFromCartOrOrder(
  cart: CommerceToolsCart | CommerceToolsOrder,
): Coupon[] {
  const coupons: Coupon[] = (cart.custom?.fields?.discount_codes ?? [])
    .map(deserializeCoupons)
    .filter(
      (coupon) =>
        coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
    ); // we already declined them, will be removed by frontend
  return uniqBy(coupons, 'code');
}
