import { LineItem } from '@commercetools/platform-sdk';

export default function checkIfItemsQuantityIsEqualOrHigherThanItemTotalQuantityDiscount(
  lineItems: LineItem[],
): boolean {
  return !!lineItems?.find((lineItem) => {
    if (lineItem.custom?.fields?.applied_codes) {
      const { quantity: itemQuantity } = lineItem;
      const totalQuantityDiscount = (
        lineItem.custom?.fields?.applied_codes ?? []
      )
        .map((code) => JSON.parse(code))
        .filter((code) => code.type === 'UNIT')
        .reduce((sum, codeObject) => {
          if (codeObject.quantity) {
            sum += codeObject.quantity;
          }
          return sum;
        }, 0);
      if (totalQuantityDiscount > itemQuantity) {
        return true;
      }
    }
    return false;
  });
}
