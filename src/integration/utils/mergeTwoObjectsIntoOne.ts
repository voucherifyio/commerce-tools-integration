export const mergeTwoObjectsIntoOne = (
  majorObject: { [key: string]: string },
  secondaryObject: { [key: string]: string },
): { [key: string]: string } => {
  const result = {};
  Object.keys(secondaryObject).forEach((key) => {
    result[key] = secondaryObject[key];
  });
  Object.keys(majorObject).forEach((key) => {
    result[key] = majorObject[key];
  });
  return result;
};
