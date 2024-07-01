import { LineItem } from '@commercetools/platform-sdk';
import {
  CartAction,
  CartActionAddLineItem,
  CartActionSetLineItemCustomType,
  DataToRunCartActionsBuilder,
} from '../CartAction';
import mapValidateCouponsResultToLineProductsWithFixedAmount from '../helpers/fixedPrice';
import addFreeLineItems from '../helpers/addFreeLineItems';

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
  lineItems: LineItem[],
): CartAction[] {
  const sumQuantity = (elements, action, key) => {
    return elements
      .filter((element) => element[key] === action.lineItemId)
      .reduce((acc, element) => acc + element.quantity, 0);
  };

  const actionsSetLineItemCustomTypeUnique = [
    ...new Map(
      actionsSetLineItemCustomType.map((action) => [action.lineItemId, action]),
    ).values(),
  ];

  return actionsSetLineItemCustomTypeUnique
    .map((action: CartActionSetLineItemCustomType) => {
      if (
        // We need to decide if this case remove item from cart or only will change quantity to lower
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

  const mergedSetLineItemCustomTypeActions =
    mergeUniqueSetLineItemCustomTypeActions(
      allActionsSetLineItemCustomType,
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
    ...mergedSetLineItemCustomTypeActions,
  ];
}
