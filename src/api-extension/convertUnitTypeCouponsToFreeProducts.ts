import {
  OrdersItem,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { ProductToAdd } from './types';

const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

// TODO: to delete once @voucherify/sdk is being updated
interface ExtendedOrdersItem extends OrdersItem {
  initial_quantity?: number;
  applied_discount_amount?: number;
  discount_quantity?: number;
  product?: {
    source_id: string;
    override?: boolean;
    name?: string;
    metadata?: Record<string, any>;
  };
}

export default function convertUnitTypeCouponsToFreeProducts(
  response: ValidationValidateStackableResponse,
): ProductToAdd[] {
  return response.redeemables
    ?.filter((redeemable) => redeemable.result?.discount?.type === 'UNIT')
    .flatMap((unitTypeRedeemable) => {
      const freeItem = unitTypeRedeemable.order?.items?.find(
        (item: ExtendedOrdersItem) =>
          item.product?.source_id ===
          unitTypeRedeemable.result?.discount?.product?.source_id,
      ) as ExtendedOrdersItem;
      const { effect: discountEffect } = unitTypeRedeemable.result?.discount;
      if (APPLICABLE_PRODUCT_EFFECT.includes(discountEffect)) {
        return [
          {
            code: unitTypeRedeemable.id,
            effect: unitTypeRedeemable.result?.discount?.effect,
            quantity: unitTypeRedeemable.result?.discount?.unit_off,
            product: unitTypeRedeemable.result?.discount.sku.source_id,
            initial_quantity: freeItem?.initial_quantity,
            discount_quantity: freeItem?.discount_quantity,
            applied_discount_amount: freeItem?.applied_discount_amount,
          },
        ];
      }

      if (discountEffect === 'ADD_MANY_ITEMS') {
        return unitTypeRedeemable.result.discount.units
          .filter((product) =>
            APPLICABLE_PRODUCT_EFFECT.includes(product.effect),
          )
          .map((product) => {
            const freeItem = unitTypeRedeemable.order?.items?.find(
              (item: ExtendedOrdersItem) =>
                item.product.source_id === product.product.source_id,
            ) as ExtendedOrdersItem;
            return {
              code: unitTypeRedeemable.id,
              effect: product.effect,
              quantity: product.unit_off,
              product: product.sku.source_id,
              initial_quantity: freeItem.initial_quantity,
              discount_quantity: freeItem.discount_quantity,
              applied_discount_amount: freeItem.applied_discount_amount,
            };
          });
      }
      return [];
    });
}
