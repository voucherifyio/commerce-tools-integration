export function isClass(object: any): boolean {
  if (!object) {
    return false;
  }
  if (typeof object !== 'object') {
    return false;
  }
  try {
    JSON.stringify(object);
    return true;
  } catch (e) {
    return false;
  }
}
