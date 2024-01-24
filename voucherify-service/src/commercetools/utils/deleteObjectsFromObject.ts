export const deleteObjectsFromObject = (e) => {
  if (!!e && typeof e === 'object')
    for (const f of Object.keys(e)) {
      if (typeof e[f] === 'object') {
        delete e[f];
      }
    }
  return e;
};
