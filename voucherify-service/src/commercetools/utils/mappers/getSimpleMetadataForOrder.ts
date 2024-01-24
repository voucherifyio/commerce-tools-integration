import { deleteObjectsFromObject } from '../deleteObjectsFromObject';
import flatten from 'flat';

export const getSimpleMetadataForOrder = (
  rawOrder: any,
  allMetadataSchemaProperties: string[],
): { [key: string]: string } => {
  const metadata = {};

  const addToMataData = (variable: any, name: string) => {
    if (typeof variable !== 'object') {
      return (metadata[name] = variable);
    }
    if (Array.isArray(variable)) {
      const newArray = [];
      variable.forEach((element) => {
        if (typeof variable !== 'object') {
          newArray.push(element);
        } else {
          newArray.push(deleteObjectsFromObject(flatten(element)));
        }
      });
      return (metadata[name] = newArray);
    }
    if (typeof variable === 'object') {
      return (metadata[name] = deleteObjectsFromObject(flatten(variable)));
    }
    return;
  };

  allMetadataSchemaProperties.forEach((key) => {
    if (rawOrder[key]) {
      addToMataData(rawOrder[key], key);
    }
  });
  return metadata;
};
