import { OrdersItem } from '@voucherify/sdk';
import {
  Coupon,
  ProductPriceAndSourceId,
  StackableRedeemableResultDiscountUnitWithCodeAndPrice,
} from '../types';
import {
  stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes,
  stackableResponseToUnitTypeRedeemables,
} from './redeemableOperationFunctions';

export function getProductsToAdd(
  validatedCoupons,
  currentPricesOfProducts,
  coupons: Coupon[],
) {
  return getCtProductsWithCurrentPriceAmount(
    stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes(
      stackableResponseToUnitTypeRedeemables(validatedCoupons, coupons),
    ),
    validatedCoupons.order.items,
    currentPricesOfProducts,
  ).map((productToAdd) => {
    return {
      code: productToAdd.unit.code,
      effect: productToAdd.unit.effect,
      quantity: productToAdd.unit.unit_off,
      product: productToAdd.unit.sku?.source_id,
      initial_quantity: productToAdd.item?.initial_quantity,
      discount_quantity: productToAdd.item?.discount_quantity,
      discount_difference:
        productToAdd.item?.applied_discount_amount -
          productToAdd.currentPriceAmount *
            productToAdd.item?.discount_quantity !==
        0,
      applied_discount_amount: productToAdd.currentPriceAmount,
    };
  });
}

export function getCtProductsWithCurrentPriceAmount(
  freeUnits: StackableRedeemableResultDiscountUnitWithCodeAndPrice[],
  orderItems: OrdersItem[],
  ctProducts: ProductPriceAndSourceId[],
): {
  currentPriceAmount: number;
  unit: StackableRedeemableResultDiscountUnitWithCodeAndPrice;
  item: OrdersItem;
  code: string;
  price: number | undefined;
  id: string;
}[] {
  return ctProducts
    .map((ctProduct) => {
      const units = freeUnits.filter(
        (unit) => unit.product.source_id === ctProduct.id,
      );
      if (!units?.length) {
        return [];
      }

      return units.map((unit) => {
        const item = orderItems?.find(
          (item) =>
            item?.sku?.source_id &&
            item?.sku?.source_id === unit.sku?.source_id,
        ) as OrdersItem;
        return {
          ...ctProduct,
          currentPriceAmount: ctProduct.price,
          unit,
          item,
          code: ctProduct.id,
        };
      });
    })
    .flat();
}
