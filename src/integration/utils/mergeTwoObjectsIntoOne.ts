export const mergeTwoObjectsIntoOne = (
  majorObject: { [key: string]: string },
  secondaryObject: { [key: string]: string },
): { [key: string]: string } => {
  return { ...secondaryObject, ...majorObject };
};
