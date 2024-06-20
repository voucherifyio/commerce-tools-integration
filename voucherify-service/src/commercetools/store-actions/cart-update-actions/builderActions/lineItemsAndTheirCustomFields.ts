import { LineItem } from '@commercetools/platform-sdk';
import {
  CartAction,
  CartActionAddLineItem,
  CartActionRemoveLineItem,
  CartActionSetLineItemCustomType,
  DataToRunCartActionsBuilder,
} from '../CartAction';
import mapValidateCouponsResultToLineProductsWithFixedAmount from '../helpers/fixedPrice';
import addFreeLineItems from '../helpers/addFreeLineItems';
import removeFreeLineItemsForNonApplicableCoupon from '../helpers/removeFreeLineItemsForNonApplicableCoupon';

function removeDuplicatedAddLineItems(
  actionsAddLineItem: CartActionAddLineItem[],
): CartActionAddLineItem[] {
  const processedAddLineItemIds = [];
  const processedAddLineItems = [];
  for (const currentAction of actionsAddLineItem) {
    if (!processedAddLineItemIds.includes(currentAction.sku)) {
      processedAddLineItemIds.push(currentAction.sku);
      processedAddLineItems.push(currentAction);
    }
  }

  return processedAddLineItems;
}

function mergeUniqueSetLineItemCustomTypeActions(
  actionsSetLineItemCustomType: CartActionSetLineItemCustomType[],
  actionsRemoveLineItem: CartActionRemoveLineItem[],
  lineItems: LineItem[],
): CartAction[] {
  const sumQuantity = (elements, action, key) => {
    return elements
      .filter((element) => element[key] === action.lineItemId)
      .reduce((acc, element) => acc + element.quantity, 0);
  };

  // If lineItem is going to be removed we don't want to set customField on it.
  const removeLineItemIdsWithQuantity = actionsRemoveLineItem.map(
    (action: CartActionRemoveLineItem) => {
      return {
        lineItemId: action.lineItemId,
        quantity: action.quantity,
      };
    },
  );

  const actionsSetLineItemCustomTypeUnique = [
    ...new Map(
      actionsSetLineItemCustomType.map((action) => [action.lineItemId, action]),
    ).values(),
  ];

  return actionsSetLineItemCustomTypeUnique
    .map((action: CartActionSetLineItemCustomType) => {
      if (
        // We need to decide if this case remove item from cart or only will change quantity to lower
        sumQuantity(removeLineItemIdsWithQuantity, action, 'lineItemId') <
        sumQuantity(lineItems, action, 'id')
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
  dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
): CartAction[] {
  const lineProductsWithFixedAmount =
    mapValidateCouponsResultToLineProductsWithFixedAmount(
      dataToRunCartActionsBuilder,
    );

  const freeLineItemsActions = addFreeLineItems(dataToRunCartActionsBuilder);

  const allActionsSetLineItemCustomType = [
    ...lineProductsWithFixedAmount,
    ...freeLineItemsActions,
  ].filter(
    (action) => action?.action === 'setLineItemCustomType',
  ) as CartActionSetLineItemCustomType[];

  const removeActions = removeFreeLineItemsForNonApplicableCoupon(
    dataToRunCartActionsBuilder,
  );

  const removeLineItemActions = removeActions.filter(
    (removeAction) => removeAction?.action === 'removeLineItem',
  ) as CartActionRemoveLineItem[];

  const mergedSetLineItemCustomTypeActions =
    mergeUniqueSetLineItemCustomTypeActions(
      allActionsSetLineItemCustomType,
      removeLineItemActions,
      dataToRunCartActionsBuilder.commerceToolsCart.lineItems,
    );

  const uniqueAddLineItems = removeDuplicatedAddLineItems(
    freeLineItemsActions.filter(
      (action) => action?.action === 'addLineItem',
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
    ...removeActions,
    ...mergedSetLineItemCustomTypeActions,
  ];
}
