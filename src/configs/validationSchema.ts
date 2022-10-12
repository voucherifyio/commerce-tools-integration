import * as Joi from 'joi';

export const ValidationSchema = Joi.object({
  APP_URL: Joi.string(),
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
});
