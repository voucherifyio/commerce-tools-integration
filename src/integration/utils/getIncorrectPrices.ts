import { ProductPriceAndSourceId } from '../types';
import { OrdersItem } from '@voucherify/sdk';

export function getIncorrectPrices(
  currentPricesOfProducts: ProductPriceAndSourceId[],
  allOrderItemsFromUnitTypeRedeemables: OrdersItem[],
) {
  return currentPricesOfProducts
    .map((productPriceAndSourceId) => {
      const { price: currentPrice, id: sourceId } = productPriceAndSourceId;
      const product = allOrderItemsFromUnitTypeRedeemables.find(
        (orderItem) => orderItem?.product?.source_id === sourceId,
      );
      if (currentPrice !== product?.price) {
        return productPriceAndSourceId;
      }
      return undefined;
    })
    .filter((e) => !!e);
}
