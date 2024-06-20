import { VoucherifyConnectorService } from '../../src/voucherify/voucherify-connector.service';

export const getVoucherifyConnectorServiceMockWithDefinedResponse = (
  response: any,
  promotions: any[] = [],
) => {
  const voucherifyConnectorService = jest.createMockFromModule(
    '../../src/voucherify/voucherify-connector.service',
  ) as VoucherifyConnectorService;

  voucherifyConnectorService.releaseValidationSession = jest
    .fn()
    .mockResolvedValue([]);

  voucherifyConnectorService.getAvailablePromotions = jest
    .fn()
    .mockResolvedValue(promotions);

  voucherifyConnectorService.validateStackableVouchers = jest
    .fn()
    .mockResolvedValue(response);

  voucherifyConnectorService.redeemStackableVouchers = jest
    .fn()
    .mockResolvedValue(response);

  voucherifyConnectorService.getMetadataSchemaProperties = jest.fn();

  voucherifyConnectorService.createOrder = jest.fn();

  return voucherifyConnectorService;
};
