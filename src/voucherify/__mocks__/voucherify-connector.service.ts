import { VoucherifyConnectorService } from '../voucherify-connector.service';

export const getVoucherifyConnectorServiceMockWithDefinedResponse = (
  response: any,
  promotions: any[] = [],
) => {
  const voucherifyConnectorService = jest.createMockFromModule(
    '../voucherify-connector.service',
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

  return voucherifyConnectorService;
};
