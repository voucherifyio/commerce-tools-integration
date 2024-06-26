import {
  CartAction,
  CartActionsBuilder,
  DataToRunCartActionsBuilder,
} from './CartAction';
import setCustomFields from './builderActions/setCustomFields';
import applyDiscounts from './builderActions/applyDiscounts';
import lineItemsAndTheirCustomFields from './builderActions/lineItemsAndTheirCustomFields';

export default function getCartActionBuilders(): CartActionsBuilder[] {
  const cartActionBuilders = [] as CartActionsBuilder[];

  cartActionBuilders.push(
    ...[
      (
        dataToRunCartActionsBuilder: DataToRunCartActionsBuilder,
      ): CartAction[] => dataToRunCartActionsBuilder.initialActions,
      applyDiscounts,
      lineItemsAndTheirCustomFields,
      setCustomFields,
    ],
  );

  return cartActionBuilders;
}
