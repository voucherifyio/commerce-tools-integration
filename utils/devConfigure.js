const nodeFetch = require('node-fetch2');

(async () => {
  //TAX-CATEGORIES
  const responseToken = await nodeFetch(
    `http://localhost:3000/tax-categories/configure`,
    {
      method: 'GET',
    },
  );
  const responseToken_ = await responseToken.json();
  console.log(`\ntax-categories/configure result:`.toUpperCase());
  console.log(responseToken_);
  console.log();
  //TYPES
  const responseToken2 = await nodeFetch(
    `http://localhost:3000/types/configure`,
    {
      method: 'GET',
    },
  );
  const responseToken2_ = await responseToken2.json();
  console.log(`\ntypes/configure result:`.toUpperCase());
  console.log(responseToken2_);
  console.log();
})();
