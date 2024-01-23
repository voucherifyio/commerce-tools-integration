import { ConfigService } from '@nestjs/config';

export const getConfigServiceMockWithConfiguredDirectDiscount = () => {
  const configService =
    jest.createMockFromModule<ConfigService>('@nestjs/config');
  configService.get = jest.fn((key) => {
    if (key === 'APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT') {
      return 'true';
    }
    if (key === 'COMMERCE_TOOLS_COUPONS_LIMIT') {
      return 5;
    }
    return null;
  });

  return configService;
};
