import { OrdersItem } from '@voucherify/sdk';
import { ProductPriceAndSourceId, ProductToAdd } from '../types';
import { FREE_SHIPPING_UNIT_TYPE } from '../../consts/voucherify';

export function getItemsWithCorrectedPrices(
  ordersItems: OrdersItem[],
  pricesIncorrect: ProductPriceAndSourceId[],
): OrdersItem[] {
  const productsToChangeSourceIds = pricesIncorrect.map(
    (productsToChange) => productsToChange.id,
  );
  return ordersItems.map((item: OrdersItem) => {
    if (item.product_id === FREE_SHIPPING_UNIT_TYPE) {
      return item;
    }
    if (item.amount !== item.discount_amount) {
      return {
        ...item,
        initial_quantity:
          item?.initial_quantity > 0 ? item.initial_quantity : undefined,
      };
    }
    const currentItemSourceId = item.product.source_id;
    if (!productsToChangeSourceIds.includes(currentItemSourceId)) {
      return {
        ...item,
        initial_quantity:
          item?.initial_quantity > 0 ? item.initial_quantity : undefined,
      };
    }
    const currentProductToChange = pricesIncorrect.find(
      (productsToChange) => productsToChange.id === item.product.source_id,
    );
    return {
      object: item?.object,
      product_id: item?.product_id,
      sku_id: item?.sku_id,
      initial_quantity:
        item?.initial_quantity > 0 ? item.initial_quantity : undefined,
      amount:
        currentProductToChange.price *
        (item.quantity ?? item.initial_quantity ?? 0),
      price: currentProductToChange.price,
      product: {
        id: item?.product?.id,
        source_id: item?.product?.source_id,
        name: item?.product?.name,
        price: currentProductToChange.price,
      },
      sku: {
        id: item?.sku?.id,
        source_id: item?.sku?.source_id,
        sku: item?.sku?.sku,
        price: currentProductToChange.price,
      },
    } as OrdersItem;
  });
}
