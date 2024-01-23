import { AppValidationPipe } from '../../src/configs/appValidationPipe';
import { ValidationSchema } from '../../src/configs/validationSchema';

describe('ConfigsTest', () => {
  it('AppValidationPipe should be defined and return value', async () => {
    const result = AppValidationPipe;
    expect(AppValidationPipe).toBeDefined();
    expect(result).toBeInstanceOf(Object);
  });

  it('ValidationSchema should be defined and return value', async () => {
    const result = ValidationSchema;
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Object);
  });

  it('ValidationSchema should remove trailing slash from APP_URL and CONNECT_SERVICE_URL', async () => {
    const exampleConfig = {
      // required configs
      VOUCHERIFY_APP_ID: 'someId',
      VOUCHERIFY_SECRET_KEY: 'someSecret',
      VOUCHERIFY_API_URL: 'https://dev.api.voucherify.io',
      COMMERCE_TOOLS_PROJECT_KEY: 'asdasd',
      COMMERCE_TOOLS_AUTH_URL:
        'https://auth.europe-west1.gcp.commercetools.com',
      COMMERCE_TOOLS_API_URL: 'https://api.europe-west1.gcp.commercetools.com',
      COMMERCE_TOOLS_ID: 'someId',
      COMMERCE_TOOLS_SECRET: 'someSecret',
      // what we test
      APP_URL: 'https://some-domain.com/',
      CONNECT_SERVICE_URL: 'https://some-other-domain.com/',
    };
    const { error, value } = ValidationSchema.validate(exampleConfig);
    expect(error).toBeUndefined();
    expect(value?.APP_URL).toEqual('https://some-domain.com');
    expect(value?.CONNECT_SERVICE_URL).toEqual('https://some-other-domain.com');
  });
});
