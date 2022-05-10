const nodeFetch = require('node-fetch2');

(async () => {
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
})();
