import { LineItem } from '@commercetools/platform-sdk';
import { ProductToAdd } from '../../../../integration/types';
import {
  CartAction,
  CartActionAddLineItem,
  CartActionChangeLineItemQuantity,
  CartActionSetLineItemCustomType,
  DataToRunCartActionsBuilder,
} from '../CartAction';
import { uniqBy } from 'lodash';

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
    fields:
      appliedCode.length === 0
        ? {}
        : {
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
    distributionChannel: undefined, //product.distributionChannel, //todo add this from price selector
    custom: {
      typeKey: 'lineItemCodesType',
      fields: {
        applied_codes: [appliedCode],
      },
    },
  };
}

export default function addFreeLineItems(
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartAction[] {
  const applicableCouponsIds =
    dataToRunCartActionsBuilder.applicableCoupons.map(
      (couponData) => couponData.id,
    );

  const findLineItemBySku = (sku: string) =>
    dataToRunCartActionsBuilder.commerceToolsCart.lineItems.find(
      (item) => item.variant.sku === sku,
    );

  const isCouponAppliedToItem = (item, couponCode: string) => {
    return item?.custom?.fields?.applied_codes
      ?.map((code) => JSON.parse(code))
      .find((code) => code.code === couponCode);
  };

  const couponsCurrentlyAppliedToItem = (item): any[] | null => {
    return item?.custom?.fields?.applied_codes?.map((code) => code);
  };

  const getAllAppliedCodes = (item, appliedCode): string[] => {
    let appliedCodes = (
      couponsCurrentlyAppliedToItem(item)?.length
        ? [...couponsCurrentlyAppliedToItem(item), appliedCode]
        : [appliedCode]
    ).filter((codeString) => {
      const codeDetails = JSON.parse(codeString);
      return applicableCouponsIds.includes(codeDetails.code);
    });
    const uniqueAppliedCodes = uniqBy(
      appliedCodes.map((codeString) => JSON.parse(codeString)),
      'code',
    );
    appliedCodes = uniqueAppliedCodes.map((codeDetails) =>
      JSON.stringify(codeDetails),
    );
    if (couponsCurrentlyAppliedToItem(item)?.length) {
      const totalDiscountQuantity = appliedCodes
        .map((code) => JSON.parse(code).quantity)
        .reduce((a, b) => a + b, 0);
      appliedCodes = appliedCodes.map((code) => {
        const _code = JSON.parse(code);
        _code.totalDiscountQuantity = totalDiscountQuantity;
        return JSON.stringify(_code);
      });
    }
    return appliedCodes;
  };

  const productToAddQuantities = {} as Record<string, number>;

  dataToRunCartActionsBuilder.productsToAdd.map((product) => {
    if (productToAddQuantities[product.product]) {
      productToAddQuantities[product.product] += product.quantity;
    } else {
      productToAddQuantities[product.product] = product.quantity;
    }
  });

  return dataToRunCartActionsBuilder.productsToAdd.flatMap((product) => {
    const item = findLineItemBySku(product.product);

    if (product.effect === 'ADD_NEW_ITEMS') {
      const appliedCode = toAppliedCode(
        product,
        product.quantity,
        productToAddQuantities[product.product] ?? product.quantity,
      );
      if (item && isCouponAppliedToItem(item, product.code)) {
        return { action: 'recalculate' }; // it is equivalent to "do nothing" action - we don't need to execute any action in this case,
        // but we need to return an action so that's the reason why it is here
      }
      if (item) {
        return [
          changeLineItemQuantity(item, item.quantity + product.quantity),
          setLineItemCustomType(item, getAllAppliedCodes(item, appliedCode)),
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
        product.quantity,
        productToAddQuantities[product.product] ?? product.quantity,
      );

      return [
        changeLineItemQuantity(item, quantity),
        setLineItemCustomType(item, getAllAppliedCodes(item, appliedCode)),
      ];
    }

    const appliedCode = toAppliedCode(
      product,
      product?.quantity,
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
