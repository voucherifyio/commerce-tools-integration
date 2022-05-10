const nodeFetch = require('node-fetch2');
const { base64encode } = require('nodejs-base64');
require('dotenv').config();

const type = {
  key: 'couponCodes', //DO NOT CHANGE the key
  name: {
    en: 'couponCodes',
  },
  description: {
    en: 'couponCodes',
  },
  resourceTypeIds: ['order'],
  fieldDefinitions: [
    {
      name: 'discount_codes',
      label: {
        en: 'discount_codes',
      },
      required: false,
      type: {
        name: 'Set',
        elementType: { name: 'String' },
      },
      inputHint: 'SingleLine',
    },
  ],
};

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
    `${process.env.COMMERCE_TOOLS_API_URL}/${process.env.COMMERCE_TOOLS_PROJECT_KEY}/types`,
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
    if (result.key === 'couponCodes') {
      found = true;
      break;
    }
  }
  if (!found) {
    const responseCT = await nodeFetch(
      `${process.env.COMMERCE_TOOLS_API_URL}/${process.env.COMMERCE_TOOLS_PROJECT_KEY}/types`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: type,
      },
    );
    const responseCT_ = await responseCT.json();
    if (!responseCT_?.id) {
      console.log(responseCT_);
      console.log('CouponCodes type not found');
      for (let i = 0; i < 49; i++) {
        console.log('COUPONCODES TYPE - WAS NOT ADDED CORRECTLY');
      }
      return console.log('COUPONCODES TYPE - WAS NOT ADDED CORRECTLY');
    }
  }
  console.log('COUPONCODES TYPE - OK');
  await setTimeout(async () => {}, 1000);
  return 0;
})();
