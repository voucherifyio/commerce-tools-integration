import { Injectable, Logger } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import { TaxCategory } from '@commercetools/platform-sdk';
import { ProductsService } from '../products/products.service';

@Injectable()
export class TaxCategoriesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly productsService: ProductsService,
    private readonly logger: Logger,
  ) {}

  async getCouponTaxCategory(): Promise<TaxCategory> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const { statusCode, body } = await ctClient
      .taxCategories()
      .get({ queryArgs: { where: 'name="coupon"' } })
      .execute();

    if ([200, 201].includes(statusCode) && body.count === 1) {
      const taxCategory = body.results[0];
      this.logger.debug({
        msg: 'Found existing coupon tax category',
        taxCategoryId: taxCategory.id,
      });
      return taxCategory;
    }

    const response = await ctClient
      .taxCategories()
      .post({
        body: {
          name: 'coupon', //DO NOT change coupon name
          rates: [],
        },
      })
      .execute();

    if (![200, 201].includes(response.statusCode)) {
      return null;
    }
    const taxCategory = response.body;
    this.logger.debug({
      msg: 'Created new tax category',
      taxCategoryId: taxCategory.id,
    });

    return taxCategory;
  }

  async configureCouponTaxCategory({
    onProgress,
  }: {
    onProgress?: (progress: number) => void;
  }): Promise<{
    success: boolean;
    couponTaxCategory: TaxCategory;
  }> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const couponTaxCategory = await this.getCouponTaxCategory();

    const rates = couponTaxCategory?.rates;

    this.logger.debug({
      msg: 'Configuring coupon tax categories',
      couponTaxCategoryId: couponTaxCategory.id,
      countryRates: rates.map((rate) => rate.country).join(', '),
    });

    const listOfCountriesUsedInAllProducts = (await ctClient.get().execute())
      .body.countries;

    const desiredRates =
      listOfCountriesUsedInAllProducts?.map((countryCode) => {
        return {
          name: 'coupon',
          amount: 0,
          country: countryCode,
          includedInPrice: true,
        };
      }) ?? [];

    const ratesToAdd = desiredRates?.filter(
      (rate) => !rates?.map((rate_) => rate_.country).includes(rate.country),
    );

    const ratesToUpdate = desiredRates.filter((desiredRate) => {
      const currentRate = rates.find(
        (currentRate) => currentRate.country === desiredRate.country,
      );
      return (
        currentRate &&
        (currentRate.amount !== desiredRate.amount ||
          currentRate.includedInPrice !== desiredRate.includedInPrice)
      );
    });

    const ratesToDelete = rates?.filter(
      (rate) =>
        !desiredRates.map((rate_) => rate_.country).includes(rate.country),
    );
    const actions = [];
    for (const rate of ratesToAdd) {
      actions.push({
        action: 'addTaxRate',
        taxRate: rate,
      });
    }
    for (const rate of ratesToDelete) {
      actions.push({
        action: 'removeTaxRate',
        taxRateId: rate.id,
      });
    }
    for (const rate of ratesToUpdate) {
      actions.push({
        action: 'replaceTaxRate',
        taxRateId: rates.find((rate_) => rate_.country === rate.country).id,
        taxRate: rate,
      });
    }

    this.logger.debug({
      msg: 'Calculated updates for countiries in coupon tax categories:',
      actions,
    });

    if (!actions.length) {
      return { success: true, couponTaxCategory };
    }

    const response = await ctClient
      .taxCategories()
      .withId({ ID: couponTaxCategory.id })
      .post({
        body: {
          version: couponTaxCategory.version,
          actions,
        },
      })
      .execute();
    const success = [200, 201].includes(response.statusCode);
    if (success) {
      this.logger.debug({ msg: 'Updated countries for coupon tax category' });
    } else {
      const msg = 'Could not update countires for coupon tax category';
      this.logger.error({
        msg,
      });
    }

    return {
      success,
      couponTaxCategory: await this.getCouponTaxCategory(),
    };
  }

  async addCountryToCouponTaxCategory(
    taxCategory: TaxCategory,
    countryCode: string,
  ) {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const response = await ctClient
      .taxCategories()
      .withId({ ID: taxCategory.id })
      .post({
        body: {
          version: taxCategory.version,
          actions: [
            {
              action: 'addTaxRate',
              taxRate: {
                name: 'coupon',
                amount: 0,
                country: countryCode,
                includedInPrice: true,
              },
            },
          ],
        },
      })
      .execute();
    const sucess = [200, 201].includes(response.statusCode);
    if (sucess) {
      this.logger.debug({ msg: 'Added country to coupon tax category' });
    } else {
      this.logger.error({
        msg: 'Could not add country to coupon tax category',
      });
    }
    return sucess;
  }
}
