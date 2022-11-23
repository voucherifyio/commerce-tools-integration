import { StackableRedeemableResponse } from '@voucherify/sdk';

export function remapRedeemablesIfProductToAddNotFound(
  redeemables: StackableRedeemableResponse[],
  couponsWithMissingProductsToAdd: string[],
): StackableRedeemableResponse[] {
  const newRedeemables = [];
  redeemables.forEach((redeemable) => {
    if (couponsWithMissingProductsToAdd.includes(redeemable.id)) {
      newRedeemables.push({
        status: 'INAPPLICABLE',
        id: redeemable.id,
        object: 'voucher',
        result: {
          error: {
            code: 404,
            key: 'not_found',
            message: 'Product not found',
            details: `Cannot find voucher with id ${redeemable.id}`,
            request_id: undefined,
          },
        },
      });
    } else {
      newRedeemables.push(redeemable);
    }
  });
  return newRedeemables;
}
