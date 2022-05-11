import { Injectable } from '@nestjs/common';
import { VoucherifyServerSide } from '@voucherify/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VoucherifyConnectorService {
  constructor(private configService: ConfigService) {
    (async () => {
      console.log(await this.getClient().vouchers.get('LtW9BAUS'));
    })();
  }
  private readonly applicationId: string =
    this.configService.get<string>('VOUCHERIFY_APP_ID');
  private readonly secretKey: string = this.configService.get<string>(
    'VOUCHERIFY_SECRET_KEY',
  );

  getClient(): ReturnType<typeof VoucherifyServerSide> {
    return VoucherifyServerSide({
      applicationId: this.applicationId,
      secretKey: this.secretKey,
    });
  }
}
