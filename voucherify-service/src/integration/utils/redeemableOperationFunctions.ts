import {
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  StackableRedeemableResultDiscountUnit,
} from '@voucherify/sdk';
import { FREE_SHIPPING_UNIT_TYPE } from '../../consts/voucherify';
import {
  Coupon,
  StackableRedeemableResultDiscountUnitWithCodeAndPrice,
  ValidatedCoupons,
} from '../types';
import { uniqBy } from 'lodash';

export function getRedeemablesByStatuses(
  redeemables: StackableRedeemableResponse[],
  statuses: StackableRedeemableResponseStatus[],
): StackableRedeemableResponse[] {
  return uniqBy(redeemables ?? [], 'id').filter((redeemable) =>
    statuses.includes(redeemable.status),
  );
}

export function getRedeemablesByStatus(
  redeemables: StackableRedeemableResponse[],
  status: StackableRedeemableResponseStatus,
): StackableRedeemableResponse[] {
  return uniqBy(redeemables ?? [], 'id').filter(
    (redeemable) => redeemable.status === status,
  );
}

export function redeemablesToCodes(
  redeemables: StackableRedeemableResponse[],
): string[] {
  return (redeemables ?? []).map((redeemable) => redeemable.id);
}

export function stackableResponseToUnitTypeRedeemables(
  validatedCoupons: ValidatedCoupons,
  coupons: Coupon[],
): StackableRedeemableResponse[] {
  const couponCodes = coupons.map((coupon) => coupon.code);
  return validatedCoupons.redeemables.filter(
    (redeemable) =>
      redeemable.result?.discount?.type === 'UNIT' &&
      redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE &&
      couponCodes.includes(redeemable.id),
  );
}

export function stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes(
  unitTypeRedeemables: StackableRedeemableResponse[],
): StackableRedeemableResultDiscountUnitWithCodeAndPrice[] {
  const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

  return unitTypeRedeemables.flatMap((unitTypeRedeemable) => {
    const discount = unitTypeRedeemable.result?.discount;
    const orderItems = unitTypeRedeemable.order.items;
    if (!discount) {
      return [];
    }
    const freeUnits = (
      discount.units?.map((unit) => {
        return { ...unit, code: unitTypeRedeemable.id };
      }) || [
        {
          ...discount,
          code: unitTypeRedeemable.id,
        } as StackableRedeemableResultDiscountUnit,
      ]
    )
      .map((freeUnit) => {
        return {
          ...freeUnit,
          code: unitTypeRedeemable.id,
          price: orderItems.find((orderItem) => {
            return (
              orderItem?.product?.source_id === freeUnit?.product?.source_id
            );
          })?.price,
        } as StackableRedeemableResultDiscountUnitWithCodeAndPrice;
      })
      .filter((unit) => APPLICABLE_PRODUCT_EFFECT.includes(unit.effect));
    if (!freeUnits.length) {
      return [];
    }
    return freeUnits;
  });
}

export function unitTypeRedeemablesToOrderItems(
  unitTypeRedeemables: StackableRedeemableResponse[],
): OrdersItem[] {
  return unitTypeRedeemables?.flatMap((e) => e.order.items);
}

export function filterOutRedeemablesIfCodeIn(
  redeemables: StackableRedeemableResponse[],
  forbiddenCodes: string[],
) {
  return redeemables.filter(
    (redeemable) => !forbiddenCodes.includes(redeemable.id),
  );
}
