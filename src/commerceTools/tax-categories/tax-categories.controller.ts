import { Controller, Get } from '@nestjs/common';
import { TaxCategoriesService } from './tax-categories.service';

const desiredRates = [
  //poszuac jakie kraje? w CT db
  { name: 'coupon', amount: 0, country: 'US', includedInPrice: true },
  { name: 'coupon', amount: 0, country: 'PL', includedInPrice: true },
];

@Controller('tax-categories')
export class TaxCategoriesController {
  constructor(private readonly taxCategoriesService: TaxCategoriesService) {}

  @Get('configure')
  async configure() {
    // const status = await this.taxCategoriesService.configureCouponTax();
    return {};
  }
}
