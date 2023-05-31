import { Test, TestingModule } from '@nestjs/testing';
import { VoucherifyConnectorService } from './voucherify-connector.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RequestJsonLogger } from '../configs/requestJsonLogger';

describe('VoucherifyConnectorService', () => {
  let service: VoucherifyConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        VoucherifyConnectorService,
        ConfigService,
        Logger,
        RequestJsonLogger,
      ],
    }).compile();

    service = module.get<VoucherifyConnectorService>(
      VoucherifyConnectorService,
    );

    service.getClient = jest.fn().mockResolvedValue({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('defines getClient()', () => {
    expect(typeof service.getClient).toBe('function');
  });

  it('defines validateStackableVouchers()', () => {
    expect(typeof service.validateStackableVouchers).toBe('function');
  });

  it('defines createOrder()', () => {
    expect(typeof service.createOrder).toBe('function');
  });

  it('defines redeemStackableVouchers()', () => {
    expect(typeof service.redeemStackableVouchers).toBe('function');
  });

  it('defines getMetadataSchemaProperties()', () => {
    expect(typeof service.getMetadataSchemaProperties).toBe('function');
  });

  it('defines getAvailablePromotions()', () => {
    expect(typeof service.getAvailablePromotions).toBe('function');
  });
});
