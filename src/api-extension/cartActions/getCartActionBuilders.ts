import { CartActionsBuilder } from './CartAction';
import setCustomFields from './builderActions/setCustomFields';
import customLineItems from './builderActions/customLineItems';
import lineItemsAndTheirCustomFields from './builderActions/lineItemsAndTheirCustomFields';

export default function getCartActionBuilders(): CartActionsBuilder[] {
  const cartActionBuilders = [] as CartActionsBuilder[]; //setCustomField

  cartActionBuilders.push(
    ...[customLineItems, lineItemsAndTheirCustomFields, setCustomFields],
  );

  return cartActionBuilders;
}
