const nodeFetch = require('node-fetch2');
const { base64encode } = require('nodejs-base64');
require('dotenv').config();

(async () => {
  const responseToken = await nodeFetch(
    `${process.env.COMMERCE_TOOLS_AUTH_URL}/oauth/token`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          base64encode(
            `${process.env.COMMERCE_TOOLS_CLIENT_ID}:${process.env.COMMERCE_TOOLS_SECRET}`,
          ),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `${encodeURIComponent('grant_type')}=${encodeURIComponent(
        'client_credentials',
      )}`,
    },
  );
  const responseToken_ = await responseToken.json();
  const accessToken = responseToken_.access_token;

  const responseCT = await nodeFetch(
    `${process.env.COMMERCE_TOOLS_API_URL}/${process.env.COMMERCE_TOOLS_PROJECT_KEY}/tax-categories`,
    {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const responseCT_ = await responseCT.json();
  let found = false;
  for (const result of responseCT_.results) {
    if (result.name === 'coupon') {
      found = true;
      break;
    }
  }
  if (!found) {
    const category = {
      name: 'coupon',
      rates: [
        { name: 'coupon', amount: 0, country: 'US', includedInPrice: true }, //for each country use
      ],
    };
    const responseCT = await nodeFetch(
      `${process.env.COMMERCE_TOOLS_API_URL}/${process.env.COMMERCE_TOOLS_PROJECT_KEY}/tax-categories`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: category,
      },
    );
    const responseCT_ = await responseCT.json();
    if (!responseCT_?.id) {
      console.log(responseCT_);
      console.log('Coupon tax category not found');
      for (let i = 0; i < 49; i++) {
        console.log('COUPON TAX CATEGORY - WAS NOT ADDED CORRECTLY');
      }
      return console.log('COUPON TAX CATEGORY - WAS NOT ADDED CORRECTLY');
    }
  }
  console.log('COUPON TAX CATEGORY - OK');
  await setTimeout(async () => {}, 1000);
  return 0;
})();
