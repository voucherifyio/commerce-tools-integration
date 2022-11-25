import { Command, CommandRunner } from 'nest-commander';
import loadingCli from 'loading-cli';
import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';

@Command({
  name: 'config',
  description: `Set up the required basic configuration in commercetools:
  1. custom coupon type - needed to store coupons codes inside the [Cart](https://docs.commercetools.com/api/projects/carts) object
  2. coupon tax category - needed for any coupon or gift card with a fixed amount discount
  `,
})
export class ConfigCommand implements CommandRunner {
  constructor(
    private readonly typesService: CustomTypesService,
    private readonly taxCategoriesService: TaxCategoriesService,
  ) {}
  async run(): Promise<void> {
    const spinnerCouponsTypes = loadingCli(
      `[1/2] Attempt to configure required coupon types in Commercetools`,
    ).start();

    const { success: couponTypesCreated } =
      await this.typesService.configureCouponTypes();
    if (couponTypesCreated) {
      spinnerCouponsTypes.succeed('[1/2] Coupon custom-types configured');
    } else {
      spinnerCouponsTypes.fail('[1/2] Could not configure coupon codes');
    }

    const spinnerTaxCategories = loadingCli(
      '[2/2] Attempt to configure coupon tax categories in Commercetools',
    ).start();

    const  couponTaxCategoriesCreated = await this.taxCategoriesService.configureCouponTaxCategory();
    if (couponTaxCategoriesCreated) {
      spinnerTaxCategories.succeed('[2/2] Coupon tax categories configured');
    } else {
      spinnerTaxCategories.fail(
        '[2/2] Could not configure coupon tax categories',
      );
    }
  }
}
