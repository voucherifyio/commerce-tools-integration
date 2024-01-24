import { LineItem } from '@commercetools/platform-sdk';
import { Item } from '../../../integration/types';
import { getQuantity } from '../../../integration/utils/mappers/product';

export function mapLineItemsToIntegrationType(lineItems: LineItem[]): Item[] {
  return lineItems
    .filter((item) => getQuantity(item) > 0)
    .map((item) => {
      return {
        source_id: item?.variant?.sku,
        quantity: getQuantity(item),
        price: item.price.value.centAmount,
        amount: item.price.value.centAmount * getQuantity(item),
        name: Object?.values(item.name)?.[0],
        sku: Object?.values(item.name)?.[0],
        attributes: item?.variant.attributes,
      };
    });
}
