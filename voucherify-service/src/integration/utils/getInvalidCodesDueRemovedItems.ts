import {
  stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes,
  stackableResponseToUnitTypeRedeemables,
} from './redeemableOperationFunctions';
import { filterOutCouponsStatusNew } from './couponsOperationFunctions';

export const getInvalidCodesDueRemovedItems = (
  validatedCoupons,
  applicableCoupons,
  cart,
) => {
  const invalidCodes: string[] = [];
  const applicableCouponsUnits =
    stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes(
      stackableResponseToUnitTypeRedeemables(
        validatedCoupons,
        filterOutCouponsStatusNew(applicableCoupons),
      ),
    );
  const itemsQuantity = cart.items.reduce((accumulator, item) => {
    if (!item.source_id) {
      return accumulator;
    }
    if (accumulator[item.source_id]) {
      accumulator[item.source_id] += item.quantity || 0;
    } else {
      accumulator[item.source_id] = item.quantity || 0;
    }
    return accumulator;
  }, {});
  applicableCouponsUnits.forEach((discountUnit) => {
    const id = discountUnit.sku.source_id;
    const quantity = discountUnit.unit_off;
    const code = discountUnit.code;
    if (itemsQuantity[id] === undefined) {
      invalidCodes.push(code);
    }
    itemsQuantity[id] -= quantity;
    if (typeof itemsQuantity[id] === 'number' && itemsQuantity[id] < 0) {
      invalidCodes.push(code);
    }
  });
  return invalidCodes;
};
