import { StackableRedeemableResponse } from '@voucherify/sdk';

export function replaceCodesWithInapplicableCoupons(
  codes: string[],
  errorMessage = `Product not found`,
): StackableRedeemableResponse[] {
  return codes.map((code) => {
    return {
      status: 'INAPPLICABLE',
      id: code,
      object: 'voucher',
      result: {
        error: {
          code: 404,
          key: 'not_found',
          message: errorMessage,
          details: `Cannot find voucher with id ${code}`,
          request_id: undefined,
        },
      },
    };
  });
}
