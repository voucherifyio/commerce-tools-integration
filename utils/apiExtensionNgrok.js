require('dotenv').config();
const ngrok = require('ngrok');
const { getClient } = require('./sdkCommerceTools');

(async () => {
  ngrok.connect(3000).then(async (url) => {
    const ctpClient = await getClient();
    let responseExtensions = await ctpClient.extensions().get().execute();
    if (responseExtensions.body.total > 0) {
      for (const extension of responseExtensions.body.results) {
        await ctpClient
          .extensions()
          .withId({ ID: extension.id })
          .delete({ queryArgs: { version: extension.version } })
          .execute();
      }
      responseExtensions = await ctpClient.extensions().get().execute();
      if (responseExtensions?.body?.total > 0) {
        throw new Error('should be NO api extensions');
      }
    }

    const newExtension = await ctpClient
      .extensions()
      .post({
        body: {
          destination: {
            type: 'HTTP',
            url: `${url}/api-extension`,
            authentication: {
              type: 'AuthorizationHeader',
              headerValue: `Basic ${process.env.API_EXTENSION_BASIC_AUTH_PASSWORD}`,
            },
          },
          triggers: [
            { resourceTypeId: 'cart', actions: ['Create', 'Update'] },
            // { resourceTypeId: 'customer', actions: ['Create', 'Update'] },
            // { resourceTypeId: 'order', actions: ['Create', 'Update'] },
          ],
        },
      })
      .execute();

    if (!newExtension.body?.id) {
      console.log(newExtension);
      console.log('API Extension was most likely not added');
      for (let i = 0; i < 49; i++) {
        console.log('API Extension - WAS NOT ESTABLISHED');
      }
      return console.log('API Extension - WAS NOT ESTABLISHED');
    }
    return console.log('API Extension - OK');
  });
})();
