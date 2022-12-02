import { StackableRedeemableResultDiscountUnitWithCodeAndPrice } from '../types';

export function getCodesIfProductNotFoundIn(
  stackableRedeemablesResultDiscountUnitWithPriceAndCodes: StackableRedeemableResultDiscountUnitWithCodeAndPrice[],
  notFoundProductSourceIds: string[],
) {
  const codesWithDuplicates =
    stackableRedeemablesResultDiscountUnitWithPriceAndCodes
      .map((stackableRedeemableResultDiscountUnitWithPriceAndCodes) => {
        const code =
          stackableRedeemableResultDiscountUnitWithPriceAndCodes?.code;
        const sourceId =
          stackableRedeemableResultDiscountUnitWithPriceAndCodes?.product
            ?.source_id;
        if (notFoundProductSourceIds.includes(sourceId)) {
          return code;
        }
        return undefined;
      })
      .filter((e) => !!e);

  return [...new Set(codesWithDuplicates)];
}
