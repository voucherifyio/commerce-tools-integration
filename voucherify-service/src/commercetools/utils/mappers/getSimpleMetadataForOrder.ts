import { deleteObjectsFromObject } from '../deleteObjectsFromObject';
import flatten from 'flat';

export const getSimpleMetadataForOrder = (
  rawOrder: any,
  allMetadataSchemaProperties: string[],
): { [key: string]: string } => {
  const metadata = {};

  const addToMetaData = (variable: any, name: string) => {
    if (typeof variable !== 'object') {
      metadata[name] = variable;
    } else if (Array.isArray(variable)) {
      metadata[name] = variable.map((item) =>
        typeof variable !== 'object'
          ? item
          : deleteObjectsFromObject(flatten(item)),
      );
    } else {
      metadata[name] = deleteObjectsFromObject(flatten(variable));
    }
  };

  for (const key of allMetadataSchemaProperties) {
    const value = rawOrder[key];
    if (value) {
      addToMetaData(value, key);
    }
  }
  return metadata;
};
