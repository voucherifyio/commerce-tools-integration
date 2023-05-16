import { ProductsFromRedeemables, ProductToAdd } from '../../types';

export const getMissingProductsToAdd = (
  productsFromRedeemables: ProductsFromRedeemables[],
  productsToAdd: ProductToAdd[],
): { code: string; quantity: number; product: string }[] => {
  const missingProductsToAdd = [];
  productsFromRedeemables.forEach((expectedProductToAdd) => {
    const sameExpectedProductsToAdd = productsFromRedeemables.filter(
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
