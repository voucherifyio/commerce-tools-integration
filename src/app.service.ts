import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Voucherify <> Commerce Tools integration app';
  }
}
