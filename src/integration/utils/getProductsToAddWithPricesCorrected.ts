import {
  OrdersItem,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { ProductPriceAndSourceId, ProductToAdd } from '../types';
import { FREE_SHIPPING_UNIT_TYPE } from '../../consts/voucherify';
import {
  stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes,
  stackableResponseToUnitTypeRedeemables,
} from './redeemableOperationFunctions';

export function getProductsToAddWithCorrectedPrices(
  validatedCoupons: ValidationValidateStackableResponse,
  currentPricesOfProducts: ProductPriceAndSourceId[],
): OrdersItem[] {
  const unitStackableRedeemablesResultDiscountUnitWithCodes =
    stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes(
      stackableResponseToUnitTypeRedeemables(validatedCoupons),
    );

  console.log(unitStackableRedeemablesResultDiscountUnitWithCodes);

  const ordersItems = validatedCoupons.order.items;
  return ordersItems
    .filter((item) => item.product_id !== FREE_SHIPPING_UNIT_TYPE)
    .map((item: OrdersItem) => {
      const currentProductToChange = currentPricesOfProducts.find(
        (productsToChange) => productsToChange.id === item.product.source_id,
      );
      if (!currentProductToChange || item?.discount_quantity < 1)
        return undefined;
      //todo ToItemUnique

      return {
        object: item?.object,
        product_id: item?.product_id,
        sku_id: item?.sku_id,
        initial_quantity:
          item?.initial_quantity > 0 ? item.initial_quantity : undefined,
        amount:
          currentProductToChange.price *
            (item.quantity ?? item.initial_quantity ?? 0) ?? undefined,
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
    })
    .filter((e) => !!e);
}
