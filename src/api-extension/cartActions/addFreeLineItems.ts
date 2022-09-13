import { Cart, LineItem } from '@commercetools/platform-sdk';
import { ProductToAdd, ValidateCouponsResult } from '../types';
import {
  CartAction,
  CartActionAddLineItem,
  CartActionChangeLineItemQuantity,
  CartActionSetLineItemCustomType,
} from './CartAction';

function toAppliedCode(
  product: ProductToAdd,
  quantity: number,
  totalDiscountQuantity: number,
): string {
  return JSON.stringify({
    code: product.code,
    type: 'UNIT',
    effect: product.effect,
    quantity,
    totalDiscountQuantity,
  });
}

const findLineItemRelatedToProduct = (cart: Cart, product: ProductToAdd) =>
  cart.lineItems.find(
    (item) =>
      item.custom?.fields?.applied_codes?.filter(
        (applied) => JSON.parse(applied).code === product.code,
      ).length === 1,
  );

function changeLineItemQuantity(
  item: LineItem,
  quantity: number,
): CartActionChangeLineItemQuantity {
  return {
    action: 'changeLineItemQuantity',
    lineItemId: item.id,
    quantity,
  };
}

function setLineItemCustomType(
  item: LineItem,
  appliedCode: string,
): CartActionSetLineItemCustomType {
  return {
    action: 'setLineItemCustomType',
    lineItemId: item.id,
    type: {
      key: 'lineItemCodesType',
    },
    fields: {
      applied_codes: [appliedCode],
    },
  };
}

function addLineItem(
  product: ProductToAdd,
  quantity: number,
  appliedCode: string,
): CartActionAddLineItem {
  return {
    action: 'addLineItem',
    sku: product.product,
    quantity,
    distributionChannel: product.distributionChannel,
    custom: {
      typeKey: 'lineItemCodesType',
      fields: {
        applied_codes: [appliedCode],
      },
    },
  };
}

const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

function canBeApplied(cart: Cart, product: ProductToAdd): boolean {
  const item = findLineItemRelatedToProduct(cart, product);
  const freeQuantity =
    product.effect === 'ADD_MISSING_ITEMS'
      ? product.discount_quantity
      : product.quantity;
  return (
    !item ||
    (APPLICABLE_PRODUCT_EFFECT.includes(product.effect) &&
      item.quantity < freeQuantity)
  );
}

export default function addFreeLineItems(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const findLineItemBySku = (sku: string) =>
    cart.lineItems.find((item) => item.variant.sku === sku);

  const productToAddQuantities = {} as Record<string, number>;

  validateCouponsResult.productsToAdd.map((product) => {
    if (productToAddQuantities[product.product]) {
      productToAddQuantities[product.product] += product.quantity;
    } else {
      productToAddQuantities[product.product] = product.quantity;
    }
  });

  return validateCouponsResult.productsToAdd
    .filter((product) => canBeApplied(cart, product))
    .flatMap((product) => {
      const item = findLineItemBySku(product.product);
      if (product.effect === 'ADD_NEW_ITEMS') {
        const appliedCode = toAppliedCode(
          product,
          product.quantity,
          productToAddQuantities[product.product] ?? product.quantity,
        );

        if (item) {
          return [
            changeLineItemQuantity(item, item.quantity + product.quantity),
            setLineItemCustomType(item, appliedCode),
          ] as CartAction[];
        }
        return [addLineItem(product, product.quantity, appliedCode)];
      }

      // ADD_MISSING_ITEMS
      if (item) {
        const quantity =
          item.quantity >= product.discount_quantity
            ? item.quantity
            : product.discount_quantity;
        const appliedCodeQuantity =
          item.quantity >= product.discount_quantity ? 0 : item.quantity;

        const appliedCode = toAppliedCode(
          product,
          appliedCodeQuantity,
          productToAddQuantities[product.product] ?? product.quantity,
        );

        return [
          changeLineItemQuantity(item, quantity),
          setLineItemCustomType(item, appliedCode),
        ];
      }
      const appliedCode = toAppliedCode(
        product,
        product.discount_quantity - product.initial_quantity,
        product.discount_quantity,
      );

      return [
        addLineItem(
          product,
          product.discount_quantity - product.initial_quantity,
          appliedCode,
        ),
      ];
    });
}
