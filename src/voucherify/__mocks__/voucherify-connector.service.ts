import { VoucherifyConnectorService } from '../voucherify-connector.service';

export const getVoucherifyConnectorServiceMockWithDefinedResponse = (
  response: any,
) => {
  const voucherifyConnectorService = jest.createMockFromModule(
    '../voucherify-connector.service',
  ) as VoucherifyConnectorService;

  voucherifyConnectorService.getAvailablePromotions = jest
    .fn()
    .mockResolvedValue([]);

  voucherifyConnectorService.validateStackableVouchersWithCTCart = jest
    .fn()
    .mockResolvedValue(response);

  return voucherifyConnectorService;
};
