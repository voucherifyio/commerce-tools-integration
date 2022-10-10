import { Cart, LineItem } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../../types';
import {
  CartAction,
  CartActionAddLineItem,
  CartActionRemoveLineItem,
  CartActionSetLineItemCustomType,
} from '../CartAction';
import mapValidateCouponsResultToLineProductsWithFixedAmount from './helpers/fixedPrice';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import addFreeLineItems from './helpers/addFreeLineItems';

type LineItemFixedPrice = {
  lineItemId: string;
  couponFixedPrice: number;
};

function mergeSetLineItemCustomType22(
  lineItems: LineItem[],
  lineItemFixedPrices,
  setLineItemCustomTypeActions: CartActionSetLineItemCustomType[],
  applicableCoupons: StackableRedeemableResponse[],
) {
  const applicableCouponsIds = applicableCoupons.map(
    (couponData) => couponData.id,
  );
  console.log('length = ', lineItems.length);
  return lineItems.map((lineItem) => {
    const action = {
      action: 'setLineItemCustomType',
      lineItemId: lineItem.id,
      type: {
        key: 'lineItemCodesType',
      },
      fields: {},
    } as CartActionSetLineItemCustomType;

    const lineItemWithFixedAmount = lineItemFixedPrices.filter(
      (lineItemWithFixedAmount) =>
        lineItem.productId === lineItemWithFixedAmount.product.source_id,
    );

    if (lineItemWithFixedAmount.length > 0) {
      action.fields.coupon_fixed_price =
        lineItemWithFixedAmount[0].couponFixedPrice;
    }

    const singleSetLineItemCustomTypeAction =
      setLineItemCustomTypeActions.filter(
        (setLineItemCustomTypeAction) =>
          lineItem.id === setLineItemCustomTypeAction.lineItemId,
      );

    if (singleSetLineItemCustomTypeAction.length > 0) {
      action.fields.applied_codes =
        singleSetLineItemCustomTypeAction[0].fields.applied_codes;
    } else {
      const applied_codes = lineItem.custom?.fields?.applied_codes;
      if (applied_codes?.length) {
        let _applied_codes = applied_codes
          .map((codeString) => JSON.parse(codeString))
          .filter((codeData) => applicableCouponsIds.includes(codeData.code));
        let totalDiscountQuantity = 0;
        for (const applied_code of _applied_codes) {
          totalDiscountQuantity += applied_code.quantity;
        }
        _applied_codes = _applied_codes
          .filter((codeData) => codeData.quantity > 0)
          .map((codeData) => {
            return { ...codeData, totalDiscountQuantity };
          });
        action.fields.applied_codes = _applied_codes.map((codeData) =>
          JSON.stringify(codeData),
        );
      }
    }

    return action;
  });
}

function mergeSetLineItemCustomType12312(
  lineItems: LineItem[],
  lineItemFixedPrices: LineItemFixedPrice[],
  setLineItemCustomTypeActions: CartActionSetLineItemCustomType[],
) {
  const mergedLineItemIds = [];

  const results = [] as CartActionSetLineItemCustomType[];

  results.push(
    ...setLineItemCustomTypeActions.map((setLineItemCustomTypeAction) => {
      const couponFixedPrice = lineItemFixedPrices.find(
        (lineItemFixedPrice) =>
          lineItemFixedPrice.lineItemId ===
          setLineItemCustomTypeAction.lineItemId,
      )?.couponFixedPrice;

      if (couponFixedPrice >= 0) {
        setLineItemCustomTypeAction.fields.coupon_fixed_price =
          couponFixedPrice;
      }

      mergedLineItemIds.push(setLineItemCustomTypeAction.lineItemId);

      return setLineItemCustomTypeAction;
    }),
  );

  results.push(
    ...lineItemFixedPrices
      .filter((lineItemFixedPrice) => {
        return !mergedLineItemIds.includes(lineItemFixedPrice.lineItemId);
      })
      .map((lineItemFixedPrice) => {
        return {
          action: 'setLineItemCustomType',
          lineItemId: lineItemFixedPrice.lineItemId,
          type: {
            key: 'lineItemCodesType',
          },
          fields: {
            coupon_fixed_price: lineItemFixedPrice.couponFixedPrice,
          },
        } as CartActionSetLineItemCustomType;
      }),
  );

  results.push(
    ...lineItems
      .filter((lineItem) => {
        return !mergedLineItemIds.includes(lineItem.id);
      })
      .map((lineItem) => {
        return {
          action: 'setLineItemCustomType',
          lineItemId: lineItem.id,
          type: {
            key: 'lineItemCodesType',
          },
        } as CartActionSetLineItemCustomType;
      }),
  );

  return results;
}

function removeFreeLineItemsForNonApplicableCoupon(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const cartActions: CartAction[] = [];
  const { productsToAdd } = validateCouponsResult;
  cart.lineItems
    .filter((item) => item.custom?.fields?.applied_codes)
    .filter((item) => {
      const isCouponWhichNoLongerExist = item.custom?.fields?.applied_codes
        .map((code) => JSON.parse(code))
        .filter((code) => code.type === 'UNIT')
        .find((code) =>
          productsToAdd.map((product) => product.code).includes(code.code),
        );

      return !isCouponWhichNoLongerExist;
    })
    .forEach((item) => {
      const quantityFromCode =
        item.custom?.fields.applied_codes
          .map((code) => JSON.parse(code))
          .filter((code) => code.type === 'UNIT')
          .find(
            (code) =>
              !productsToAdd
                .map((unitCode) => unitCode.code)
                .includes(code.code),
          )?.quantity ?? 0;

      if (item.quantity > quantityFromCode) {
        cartActions.push({
          action: 'setLineItemCustomField',
          lineItemId: item.id,
          name: 'applied_codes',
        });
      }

      if (item.quantity >= quantityFromCode) {
        cartActions.push({
          action: 'removeLineItem',
          lineItemId: item.id,
          quantity: quantityFromCode,
        });
      }
    });

  return cartActions;
}

function removeDuplicatedAddLineItems(
  actionsAddLineItem: CartActionAddLineItem[],
): CartActionAddLineItem[] {
  const processedAddLineItemIds = [];
  const processedAddLineItems = [];
  for (const currentAction of actionsAddLineItem as CartActionAddLineItem[]) {
    //We delete duplicates
    if (!processedAddLineItemIds.includes(currentAction.sku)) {
      processedAddLineItemIds.push(currentAction.sku);
      processedAddLineItems.push(currentAction);
    }
  }

  return processedAddLineItems;
}

function mergeCartActions(
  actionsSetLineItemCustomType: CartActionSetLineItemCustomType[],
  actionsRemoveLineItem: CartActionRemoveLineItem[],
  lineItems: LineItem[],
): CartAction[] {
  // If lineItem is going to be removed we don't want to set customField on it.
  const removeLineItemIdsWithQuantity = actionsRemoveLineItem.map(
    (action: CartActionRemoveLineItem) => {
      return {
        lineItemId: action.lineItemId,
        quantity: action.quantity,
      };
    },
  );

  const processedSetLineItemIds = [];
  // const allActionsAddLineItem = actions.filter(
  //   (action) => action?.action === 'addLineItem',
  // );
  // const processedAddLineItemIds = [];
  // const processedAddLineItems = [];
  // for (const currentAction of allActionsAddLineItem as CartActionAddLineItem[]) {
  //   //We delete duplicates
  //   if (!processedAddLineItemIds.includes(currentAction.sku)) {
  //     processedAddLineItemIds.push(currentAction.sku);
  //     processedAddLineItems.push(currentAction);
  //   }
  // }

  // actions = actions.filter(
  //   (action) =>
  //     action?.action !== 'setLineItemCustomType' &&
  //     action?.action !== 'addLineItem',
  // );

  const actionsSetLineItemCustomTypeUnique = [
    ...new Map(
      actionsSetLineItemCustomType.map((action) => [action.lineItemId, action]),
    ).values(),
  ];

  return actionsSetLineItemCustomTypeUnique
    .map((action: CartActionSetLineItemCustomType) => {
      if (
        // We need to decide if this case remove item from cart or only will change quantity to lower
        removeLineItemIdsWithQuantity
          .filter((element) => element.lineItemId === action.lineItemId)
          .reduce((acc, element) => acc + element.quantity, 0) <
        lineItems
          .filter((lineItem) => lineItem.id === action.lineItemId)
          .reduce((acc, lineItems) => acc + lineItems.quantity, 0)
      ) {
        return {
          action: action.action,
          lineItemId: action.lineItemId,
          type: action.type,
          fields: Object.assign(
            {},
            ...actionsSetLineItemCustomType
              .filter(
                (innerAction: CartActionSetLineItemCustomType) =>
                  innerAction.lineItemId === action.lineItemId,
              )
              .map((innerAction: CartActionSetLineItemCustomType) => {
                return innerAction.fields;
              }),
          ),
        } as CartActionSetLineItemCustomType;
      }
    })
    .filter((action: CartActionSetLineItemCustomType) => action !== undefined);
}

export default function lineItemsAndTheirCustomFields(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  if (!valid && onlyNewCouponsFailed) {
    return [];
  }

  const lineProductsWithFixedAmount =
    mapValidateCouponsResultToLineProductsWithFixedAmount(
      cart,
      validateCouponsResult,
    );

  const freeLineItemsActions = addFreeLineItems(cart, validateCouponsResult);

  const allActionsSetLineItemCustomType = [
    ...lineProductsWithFixedAmount,
    ...freeLineItemsActions,
  ].filter((action) => action?.action === 'setLineItemCustomType');

  const removeActions = removeFreeLineItemsForNonApplicableCoupon(
    cart,
    validateCouponsResult,
  );

  const removeLineItemActions = removeActions.filter(
    (removeAction) => removeAction.action === 'removeLineItem',
  );

  const mergedSetLineItemCustomTypeActions = mergeCartActions(
    allActionsSetLineItemCustomType as CartActionSetLineItemCustomType[],
    removeLineItemActions as CartActionRemoveLineItem[],
    cart.lineItems,
  );

  const uniqueAddLineItems = removeDuplicatedAddLineItems(
    freeLineItemsActions.filter(
      (action) => action.action === 'addLineItem',
    ) as CartActionAddLineItem[],
  );

  return [
    ...freeLineItemsActions.filter(
      (freeLineItem) =>
        !['setLineItemCustomType', 'addLineItem'].includes(
          freeLineItem?.action,
        ),
    ),
    ...uniqueAddLineItems,
    ...mergedSetLineItemCustomTypeActions,
    ...removeActions,
  ];
}
