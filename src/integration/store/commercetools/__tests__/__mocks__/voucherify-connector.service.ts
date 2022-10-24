import { VoucherifyConnectorService } from '../../../../voucherify.service';

export const getVoucherifyConnectorServiceMockWithDefinedResponse = (
  response: any,
) => {
  const voucherifyConnectorService = jest.createMockFromModule(
    '../../../../voucherify.service',
  ) as VoucherifyConnectorService;

  voucherifyConnectorService.getAvailablePromotions = jest
    .fn()
    .mockResolvedValue([]);

  voucherifyConnectorService.validateStackableVouchersWithCTCart = jest
    .fn()
    .mockResolvedValue(response);

  return voucherifyConnectorService;
};
