import * as Joi from 'joi';

const removeTrailingSlashIfNeeded = (str: string) => {
  if (str.endsWith('/')) {
    return str.slice(0, -1);
  }
  return str;
};

const urlValidate = (value, helpers) => {
  const sanitiziedValue = removeTrailingSlashIfNeeded(value);

  if (!Joi.string().uri().validate(sanitiziedValue).error) {
    return sanitiziedValue;
  } else {
    return helpers.error('The string is not valid in the url context');
  }
};

export const ValidationSchema = Joi.object({
  APP_URL: Joi.string().custom((value, helpers) => urlValidate(value, helpers)),
  CONNECT_SERVICE_URL: Joi.string().custom((value, helpers) =>
    urlValidate(value, helpers),
  ),
  VOUCHERIFY_APP_ID: Joi.string().required(),
  VOUCHERIFY_SECRET_KEY: Joi.string().required(),
  VOUCHERIFY_API_URL: Joi.string().required(),
  COMMERCE_TOOLS_PROJECT_KEY: Joi.string().required(),
  COMMERCE_TOOLS_AUTH_URL: Joi.string().required(),
  COMMERCE_TOOLS_API_URL: Joi.string().required(),
  COMMERCE_TOOLS_ID: Joi.string().required(),
  COMMERCE_TOOLS_SECRET: Joi.string().required(),
  COMMERCE_TOOLS_API_EXTENSION_KEY: Joi.string()
    .optional()
    .default('VOUCHERIFY_INTEGRATION'),
  COMMERCE_TOOLS_COUPON_NAMES: Joi.string()
    .optional()
    .default('{"en":"Coupon codes discount","de":"Gutscheincodes rabatt"}'),
  MAX_CART_UPDATE_RESPONSE_TIME_WITHOUT_CHECKING_IF_API_EXTENSION_TIMED_OUT:
    Joi.number().integer().min(0).max(1750).optional().default(1000),
});
