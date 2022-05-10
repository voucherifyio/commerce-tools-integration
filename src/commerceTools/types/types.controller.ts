import { Controller, Get } from '@nestjs/common';
import { TypesService } from './types.service';
import { Type } from '@commercetools/platform-sdk';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Get('configure')
  async configure(): Promise<{
    success: boolean;
    couponTaxCategory?: Type;
  }> {
    return await this.typesService.configureCouponType();
  }
}
