import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';

@Injectable()
export class TaxCategoriesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  async getCouponTaxCategory(): Promise<{
    found: boolean;
    taxCategory?: { id?: string };
  }> {
    const CT = this.commerceToolsConnectorService.getClient();
    const taxCategories = await CT.taxCategories().get().execute();
    const couponTaxCategory = taxCategories.body.results.find(
      (taxCategory) => taxCategory.name === 'coupon',
    );
    if (!couponTaxCategory) return { found: false };
    return { found: true, taxCategory: couponTaxCategory };
  }

  // async configureCouponTaxCategory() {
  //   // const couponTaxCategory = this.getCouponTaxCategory();
  //   // if (!couponTaxCategory?.found) {
  //   //   //create
  //   // }
  // }
  //
  // async updateRatesInCouponCategory() {}
}
