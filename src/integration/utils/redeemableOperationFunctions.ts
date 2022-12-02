import {
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  StackableRedeemableResultDiscountUnit,
} from '@voucherify/sdk';
import { FREE_SHIPPING_UNIT_TYPE } from '../../consts/voucherify';
import { ValidationValidateStackableResponse } from '@voucherify/sdk';

export function getRedeemablesByStatus(
  redeemables: StackableRedeemableResponse[],
  status: StackableRedeemableResponseStatus,
): StackableRedeemableResponse[] {
  return (redeemables ?? []).filter(
    (redeemable) => redeemable.status === status,
  );
}

export function codesFromRedeemables(
  redeemables: StackableRedeemableResponse[],
): string[] {
  return (redeemables ?? []).map((redeemable) => redeemable.id);
}

export function getUnitTypeRedeemablesFromStackableResponse(
  validatedCoupons: ValidationValidateStackableResponse,
): StackableRedeemableResponse[] {
  return validatedCoupons.redeemables.filter(
    (redeemable) =>
      redeemable.result?.discount?.type === 'UNIT' &&
      redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE,
  );
}

export function getUnitStackableRedeemablesResultDiscountUnitFromStackableRedeemablesResponse(
  unitTypeRedeemables: StackableRedeemableResponse[],
): StackableRedeemableResultDiscountUnit[] {
  const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

  return unitTypeRedeemables.flatMap((unitTypeRedeemable) => {
    const discount = unitTypeRedeemable.result?.discount;
    if (!discount) {
      return [];
    }
    const freeUnits = (
      discount.units || [
        { ...discount } as StackableRedeemableResultDiscountUnit,
      ]
    ).filter((unit) => APPLICABLE_PRODUCT_EFFECT.includes(unit.effect));
    if (!freeUnits.length) {
      return [];
    }
    return freeUnits;
  });
}

export function unitTypeRedeemablesToOrderItems(
  unitTypeRedeemables: StackableRedeemableResponse[],
): OrdersItem[] {
  return unitTypeRedeemables.flatMap((e) => e.order.items);
}

export function filterOutRedeemablesIfCodeIn(
  redeemables: StackableRedeemableResponse[],
  forbiddenCodes: string[],
) {
  return redeemables.filter(
    (redeemable) => !forbiddenCodes.includes(redeemable.id),
  );
}
