import { Cart, LineItem } from '@commercetools/platform-sdk';
import { ProductToAdd, ValidateCouponsResult } from '../types';
import {
  CartAction,
  CartActionAddLineItem,
  CartActionChangeLineItemQuantity,
  CartActionSetLineItemCustomType,
} from './CartAction';

function toAppliedMultipleCode(
  product: ProductToAdd,
  quantity: number,
  totalDiscountQuantity: number,
  previousCode: string,
): string[] {
  return [
    previousCode,
    ...JSON.stringify({
      code: product.code,
      type: 'UNIT',
      effect: product.effect,
      quantity,
      totalDiscountQuantity,
    }),
  ];
}

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
  appliedCode: string[],
): CartActionSetLineItemCustomType {
  return {
    action: 'setLineItemCustomType',
    lineItemId: item.id,
    type: {
      key: 'lineItemCodesType',
    },
    fields: {
      applied_codes: appliedCode,
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

export default function addFreeLineItems(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const findLineItemBySku = (sku: string) =>
    cart.lineItems.find((item) => item.variant.sku === sku);

  const isCouponAppliedToItem = (item, couponCode: string) => {
    return item?.custom?.fields?.applied_codes
      .map((code) => JSON.parse(code))
      .find((code) => code.code === couponCode);
  };

  const couponsCurrentlyAppliedToItem = (item): any[] | null => {
    return item?.custom?.fields?.applied_codes.map((code) => code);
  };

  const productToAddQuantities = {} as Record<string, number>;

  validateCouponsResult.productsToAdd.map((product) => {
    if (productToAddQuantities[product.product]) {
      productToAddQuantities[product.product] += product.quantity;
    } else {
      productToAddQuantities[product.product] = product.quantity;
    }
  });

  return validateCouponsResult.productsToAdd.flatMap((product) => {
    const item = findLineItemBySku(product.product);

    if (product.effect === 'ADD_NEW_ITEMS') {
      const appliedCode = toAppliedCode(
        product,
        product.quantity,
        productToAddQuantities[product.product] ?? product.quantity,
      );
      if (item && isCouponAppliedToItem(item, product.code)) {
        return;
      }
      if (item) {
        let appliedCodes = couponsCurrentlyAppliedToItem(item).length
          ? [...couponsCurrentlyAppliedToItem(item), appliedCode]
          : [appliedCode];
        if (couponsCurrentlyAppliedToItem(item).length) {
          const totalDiscountQuantity = appliedCodes
            .map((code) => JSON.parse(code).quantity)
            .reduce((a, b) => a + b, 0);
          appliedCodes = appliedCodes.map((code) => {
            const _code = JSON.parse(code);
            _code.totalDiscountQuantity = totalDiscountQuantity;
            return JSON.stringify(_code);
          });
        }
        return [
          changeLineItemQuantity(item, item.quantity + product.quantity),
          setLineItemCustomType(item, appliedCodes),
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

      const appliedCode = toAppliedCode(
        product,
        product.discount_quantity,
        productToAddQuantities[product.product] ?? product.quantity,
      );

      let appliedCodes = couponsCurrentlyAppliedToItem(item).length
        ? [...couponsCurrentlyAppliedToItem(item), appliedCode]
        : [appliedCode];
      if (couponsCurrentlyAppliedToItem(item).length) {
        const totalDiscountQuantity = appliedCodes
          .map((code) => JSON.parse(code).quantity)
          .reduce((a, b) => a + b, 0);
        appliedCodes = appliedCodes.map((code) => {
          const _code = JSON.parse(code);
          _code.totalDiscountQuantity = totalDiscountQuantity;
          return JSON.stringify(_code);
        });
      }

      return [
        changeLineItemQuantity(item, quantity),
        setLineItemCustomType(item, appliedCodes),
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
