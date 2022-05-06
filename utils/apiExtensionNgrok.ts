// eslint-disable-next-line @typescript-eslint/no-var-requires
const { base64encode } = require('nodejs-base64');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require('node-fetch2');

(async () => {
  const responseToken = await nodeFetch(
    `${process.env.CT_AUTH_URL}/oauth/token`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          base64encode(`${process.env.CT_CLIENT_ID}:${process.env.CT_SECRET}`),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `${encodeURIComponent('grant_type')}=${encodeURIComponent(
        'client_credentials',
      )}`,
    },
  );
  const responseToken_ = await responseToken.json();
  const accessToken = responseToken_.access_token;
  const responseExtensions = await nodeFetch(
    `${process.env.CT_API_URL}/${process.env.CT_PROJECT_KEY}/extensions`,
    {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const responseExtensions_ = await responseExtensions.json();
  if (responseExtensions_.total > 0) {
    for (const extension of responseExtensions_.results) {
      await nodeFetch(
        `${process.env.CT_API_URL}/${process.env.CT_PROJECT_KEY}/extensions/${extension.id}?version=${extension.version}`,
        {
          method: 'DELETE',
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    }
    const response2Extensions = await nodeFetch(
      `${process.env.CT_API_URL}/${process.env.CT_PROJECT_KEY}/extensions`,
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const response2Extensions_ = await response2Extensions.json();
    if (response2Extensions_.total > 0) {
      throw new Error('response2Extensions_.total should be equal 0');
    }
  }

  const response3Extensions = await nodeFetch(
    `${process.env.CT_API_URL}/${process.env.CT_PROJECT_KEY}/extensions`,
    {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        destination: {
          type: 'HTTP',
          url: `${process.env.NGROK_URL}/api-extension`,
          authentication: {
            type: 'AuthorizationHeader',
            headerValue: 'Basic dXNlcjEyMzpwYXNzd29yZDEyMw==',
          },
        },
        triggers: [
          { resourceTypeId: 'cart', actions: ['Create', 'Update'] },
          { resourceTypeId: 'customer', actions: ['Create', 'Update'] },
          { resourceTypeId: 'order', actions: ['Create', 'Update'] },
        ],
      }),
    },
  );
  const response3Extensions_ = await response3Extensions.json();
  if (!response3Extensions_?.id) {
    console.log(response3Extensions_);
    console.log('API Extension was most likely not added');
    process.exit(1);
  }
  console.log('API Extension - OK');
})();
