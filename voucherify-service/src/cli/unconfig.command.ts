import { Command, CommandRunner } from 'nest-commander';
import loadingCli from 'loading-cli';
import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';
import { ConfigService } from '@nestjs/config';

@Command({
  name: 'unconfig',
  description: `Unset up the required basic configuration in commercetools:
  1. custom coupon type - needed to store coupons codes inside the [Cart](https://docs.commercetools.com/api/projects/carts) object
  (optionally based on "APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT") 2. coupon tax category - needed for any coupon or gift card with a fixed amount discount
  `,
})
export class UnconfigCommand extends CommandRunner {
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
      `[${currentStep}/${totalSteps}] Attempt to unconfigure required coupon types in Commercetools`,
    ).start();

    const { success: couponTypesCreated } =
      await this.typesService.unconfigureCouponTypes();
    if (couponTypesCreated) {
      spinnerCouponsTypes.succeed(
        `[${currentStep}/${totalSteps}] Coupon custom-types unconfigured`,
      );
    } else {
      spinnerCouponsTypes.fail(
        `[${currentStep}/${totalSteps}] Could not unconfigure coupon codes`,
      );
    }

    if (applyCartDiscountAsCtDirectDiscount) {
      return;
    }
    currentStep++;
    const spinnerTaxCategories = loadingCli(
      `[${currentStep}/${totalSteps}] Attempt to unconfigure coupon tax categories in Commercetools`,
    ).start();

    const { success: couponTaxCategoriesCreated } =
      await this.taxCategoriesService.unconfigureCouponTaxCategory();
    if (couponTaxCategoriesCreated) {
      spinnerTaxCategories.succeed(
        `[${currentStep}/${totalSteps}] Coupon tax categories unconfigured`,
      );
    } else {
      spinnerTaxCategories.fail(
        `[${currentStep}/${totalSteps}] Could not unconfigure coupon tax categories`,
      );
    }
  }
}
