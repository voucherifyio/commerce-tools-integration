export const getMaxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut =
  (value: any, defaultValue = 1000) => {
    if (typeof value === 'string') {
      try {
        if (isNaN(parseInt(value))) {
          return defaultValue;
        }
        if (parseInt(value) >= 0 && parseInt(value) <= 1750) {
          return parseInt(value);
        }
      } catch (e) {
        return defaultValue;
      }
    }
    if (typeof value === 'number') {
      if (value >= 0 && value <= 1750) {
        return value;
      }
    }
    return defaultValue;
  };
