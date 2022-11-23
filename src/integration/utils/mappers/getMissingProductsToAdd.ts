import { ExpectedProductToAdd, ProductToAdd } from '../../types';

export const getMissingProductsToAdd = (
  expectedProductsToAdd: ExpectedProductToAdd[],
  productsToAdd: ProductToAdd[],
): { code: string; quantity: number; product: string }[] => {
  const missingProductsToAdd = [];
  expectedProductsToAdd.forEach((expectedProductToAdd) => {
    const sameExpectedProductsToAdd = expectedProductsToAdd.filter(
      (expectedProductToAdd_) =>
        expectedProductToAdd.code === expectedProductToAdd_.code &&
        expectedProductToAdd.quantity === expectedProductToAdd_.quantity &&
        expectedProductToAdd.product === expectedProductToAdd_.product,
    );
    const productsToAddSameAsExpectedProductsToAdd = productsToAdd.filter(
      (expectedProductTopAdd_) =>
        expectedProductToAdd.code === expectedProductTopAdd_.code &&
        expectedProductToAdd.quantity === expectedProductTopAdd_.quantity &&
        expectedProductToAdd.product === expectedProductTopAdd_.product,
    );
    if (
      sameExpectedProductsToAdd.length !==
      productsToAddSameAsExpectedProductsToAdd.length
    ) {
      missingProductsToAdd.push(expectedProductToAdd);
    }
  });
  return missingProductsToAdd;
};
