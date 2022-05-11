const { ClientBuilder } = require('@commercetools/sdk-client-v2');
const {
  createApiBuilderFromCtpClient,
} = require('@commercetools/platform-sdk');
const fetch = require('node-fetch2');

const httpMiddlewareOption = {
  host: process.env.COMMERCE_TOOLS_API_URL,
  fetch,
};

const authMiddlewareOptions = {
  host: process.env.COMMERCE_TOOLS_AUTH_URL,
  projectKey: process.env.COMMERCE_TOOLS_PROJECT_KEY,
  credentials: {
    clientId: process.env.COMMERCE_TOOLS_ID,
    clientSecret: process.env.COMMERCE_TOOLS_SECRET,
  },
  fetch,
};

exports.getClient = () => {
  const ctpClient = new ClientBuilder()
    .withProjectKey(process.env.COMMERCE_TOOLS_PROJECT_KEY)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOption)
    .withLoggerMiddleware()
    .build();

  return createApiBuilderFromCtpClient(ctpClient).withProjectKey({
    projectKey: process.env.COMMERCE_TOOLS_PROJECT_KEY,
  });
};
