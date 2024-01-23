import { getSimpleMetadataForOrder } from '../../commercetools/utils/mappers/getSimpleMetadataForOrder';
import { mergeTwoObjectsIntoOne } from './mergeTwoObjectsIntoOne';

export const getOrderMetadata = async (
  rawCtOrder,
  orderMetadataSchemaProperties,
  getCustomMetadataForOrder = undefined,
) => {
  if (
    !(rawCtOrder instanceof Object) ||
    !orderMetadataSchemaProperties?.length
  ) {
    return {};
  }
  const simpleMetadata = getSimpleMetadataForOrder(
    rawCtOrder,
    orderMetadataSchemaProperties,
  );
  if (typeof getCustomMetadataForOrder !== 'function') {
    return simpleMetadata;
  } else {
    const customMetadata = await getCustomMetadataForOrder(
      rawCtOrder,
      orderMetadataSchemaProperties,
    );
    if (Object.keys(customMetadata).length > 0) {
      return mergeTwoObjectsIntoOne(customMetadata, simpleMetadata);
    }
  }
};
