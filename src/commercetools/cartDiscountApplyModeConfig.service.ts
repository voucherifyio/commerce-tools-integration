import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CartDiscountApplyMode } from './types';

@Injectable()
export class CartDiscountApplyModeConfigService {
  constructor(private configService: ConfigService) {}

  get getCartDiscountApplyMode(): CartDiscountApplyMode {
    return this.configService.get<string>(
      'APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT',
    ) === 'true'
      ? CartDiscountApplyMode.DirectDiscount
      : CartDiscountApplyMode.CustomLineItem;
  }
}
