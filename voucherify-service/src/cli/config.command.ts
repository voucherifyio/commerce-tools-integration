import { Command, CommandRunner } from 'nest-commander';
import loadingCli from 'loading-cli';
import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';
import { ConfigService } from '@nestjs/config';

@Command({
  name: 'config',
  description: `Set up the required basic configuration in commercetools:
  1. custom coupon type - needed to store coupons codes inside the [Cart](https://docs.commercetools.com/api/projects/carts) object
  (optionally based on "APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT") 2. coupon tax category - needed for any coupon or gift card with a fixed amount discount
  `,
})
export class ConfigCommand extends CommandRunner {
  constructor(
    private readonly typesService: CustomTypesService,
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const applyCartDiscountAsCtDirectDiscount =
      this.configService.get<string>(
        'APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT',
      ) === 'true';
    const totalSteps: number = applyCartDiscountAsCtDirectDiscount ? 1 : 2;
    let currentStep = 1;
    const spinnerCouponsTypes = loadingCli(
      `[${currentStep}/${totalSteps}] Attempt to configure required coupon types in Commercetools`,
    ).start();

    const couponTypesCreated =
      (await this.typesService.configureCouponTypes())?.success || false;
    if (couponTypesCreated) {
      spinnerCouponsTypes.succeed(
        `[${currentStep}/${totalSteps}] Coupon custom-types configured`,
      );
    } else {
      spinnerCouponsTypes.fail(
        `[${currentStep}/${totalSteps}] Could not configure coupon codes`,
      );
    }

    if (applyCartDiscountAsCtDirectDiscount) {
      process.exit(0);
    }
    currentStep++;
    const spinnerTaxCategories = loadingCli(
      `[${currentStep}/${totalSteps}] Attempt to configure coupon tax categories in Commercetools`,
    ).start();

    const couponTaxCategoriesCreated =
      await this.taxCategoriesService.configureCouponTaxCategory();
    if (couponTaxCategoriesCreated) {
      spinnerTaxCategories.succeed(
        `[${currentStep}/${totalSteps}] Coupon tax categories configured`,
      );
    } else {
      spinnerTaxCategories.fail(
        `[${currentStep}/${totalSteps}] Could not configure coupon tax categories`,
      );
    }
    process.exit(0);
  }
}
