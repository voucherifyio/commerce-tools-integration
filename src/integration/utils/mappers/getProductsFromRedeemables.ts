import { StackableRedeemableResponse } from '@voucherify/sdk';
import { ProductsFromRedeemables } from '../../types';

export const getProductsFromRedeemables = (
  redeemables: StackableRedeemableResponse[],
): ProductsFromRedeemables[] => {
  const expectedProductsToAdd = [];
  redeemables.forEach((redeemable) => {
    const discount = redeemable?.result?.discount;
    const code = redeemable.id;
    if (!discount) {
      return;
    }
    if (!discount?.units?.length) {
      return expectedProductsToAdd.push({
        code,
        quantity: discount?.unit_off,
        product: discount?.sku?.source_id,
      });
    }
    discount.units.forEach((unit) =>
      expectedProductsToAdd.push({
        code,
        quantity: unit?.unit_off,
        product: unit?.sku?.source_id,
      }),
    );
  });
  return expectedProductsToAdd;
};
