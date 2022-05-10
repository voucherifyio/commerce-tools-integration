const nodeFetch = require('node-fetch2');
const { base64encode } = require('nodejs-base64');
require('dotenv').config();

const desiredRates = [
  //poszuac jakie kraje? w CT db
  { name: 'coupon', amount: 0, country: 'US', includedInPrice: true },
  { name: 'coupon', amount: 0, country: 'PL', includedInPrice: true },
];

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
  let taxCategory;
  let found = false;
  for (const result of responseCT_.results) {
    if (result.name === 'coupon') {
      found = true;
      taxCategory = result;
      break;
    }
  }
  if (!found) {
    const category = {
      name: 'coupon', //DO NOT change the name
      rates: [],
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
      console.log('COUPON TAX CATEGORY - WAS NOT ADDED CORRECTLY');
      return process.exit(1);
    } else {
      taxCategory = responseCT_;
    }
  }
  if (!taxCategory?.id) {
    console.log(`COUPON TAX CATEGORY is missing id`);
    return process.exit(1);
  }
  const rates = taxCategory.rates;

  const ratesToAdd = desiredRates.filter(
    (rate) => !rates.map((rate_) => rate_.country).includes(rate.country),
  );
  const ratesToUpdate = desiredRates.filter((rate) =>
    rates.map((rate_) => rate_.country).includes(rate.country),
  );
  const ratesToDelete = rates.filter(
    (rate) =>
      !desiredRates.map((rate_) => rate_.country).includes(rate.country),
  );

  const actions = [];
  for (const rate of ratesToAdd) {
    actions.push({
      action: 'addTaxRate',
      taxRate: rate,
    });
  }
  for (const rate of ratesToDelete) {
    actions.push({
      action: 'removeTaxRate',
      taxRateId: rate.id,
    });
  }
  for (const rate of ratesToUpdate) {
    actions.push({
      action: 'replaceTaxRate',
      taxRateId: rates.find((rate_) => rate_.country === rate.country).id,
      taxRate: rate,
    });
  }
  if (actions.length) {
    const responseCT = await nodeFetch(
      `${process.env.COMMERCE_TOOLS_API_URL}/${process.env.COMMERCE_TOOLS_PROJECT_KEY}/tax-categories/${taxCategory.id}`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          version: taxCategory.version,
          actions: actions,
        }),
      },
    );
    const responseCT_ = await responseCT.json();
    if (!responseCT_?.id) {
      console.log(
        'Tax rates in COUPON TAX CATEGORY - were not updated correctly',
      );
      return process.exit(1);
    }
  }
  console.log('COUPON TAX CATEGORY - OK');
  await setTimeout(async () => {}, 1000);
  return 0;
})();
