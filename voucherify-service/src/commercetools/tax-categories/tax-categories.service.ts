import { Injectable, Logger } from '@nestjs/common';
import { CommercetoolsConnectorService } from '../commercetools-connector.service';
import {
  TaxCategory,
  TaxCategoryAddTaxRateAction,
  TaxCategoryRemoveTaxRateAction,
  TaxCategoryReplaceTaxRateAction,
  TaxRate,
} from '@commercetools/platform-sdk';

@Injectable()
export class TaxCategoriesService {
  constructor(
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly logger: Logger,
  ) {}

  private couponTaxCategory: TaxCategory = null;

  public async getCouponTaxCategoryAndUpdateItIfNeeded(
    country: string,
  ): Promise<TaxCategory> {
    if (!country) {
      const msg = 'Country was not provided to obtain coupon tax category!';
      this.logger.error({ msg });
      throw new Error(msg);
    }
    const couponTaxCategory =
      await this.getCashedCouponTaxCategoryOrFromNewRequest();
    if (!couponTaxCategory) {
      const msg = 'Coupon tax category was not configured correctly';
      this.logger.error({ msg });
      throw new Error(msg);
    }

    if (!couponTaxCategory?.rates?.find((rate) => rate.country === country)) {
      await this.addCountryToCouponTaxCategory(couponTaxCategory, country);
      return await this.getCashedCouponTaxCategoryOrFromNewRequest();
    }
    return couponTaxCategory;
  }

  async getCashedCouponTaxCategoryOrFromNewRequest(): Promise<TaxCategory> {
    if (this.couponTaxCategory) {
      return this.couponTaxCategory;
    }
    const ctClient = this.commerceToolsConnectorService.getClient();
    const { statusCode, body } = await ctClient
      .taxCategories()
      .get({ queryArgs: { where: 'name="coupon"' } })
      .execute()
      .catch((result) => result);

    if ([200, 201].includes(statusCode) && body.count === 1) {
      this.logger.debug({
        msg: 'Found existing coupon tax category',
        taxCategoryId: body.results[0].id,
      });
      return body.results[0];
    }

    const response = await ctClient
      .taxCategories()
      .post({
        body: {
          name: 'coupon', //DO NOT change coupon name
          rates: [],
        },
      })
      .execute()
      .catch((result) => result);

    if (![200, 201].includes(response.statusCode)) {
      return null;
    }

    this.logger.debug({
      msg: 'Created new coupon tax category',
      taxCategoryId: response.body.id,
    });

    return response.body;
  }

  public async configureCouponTaxCategory(): Promise<TaxCategory> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const couponTaxCategory =
      await this.getCashedCouponTaxCategoryOrFromNewRequest();

    const currentRates = couponTaxCategory?.rates;

    this.logger.debug({
      msg: 'Configuring coupon tax categories',
      couponTaxCategoryId: couponTaxCategory.id,
      countryRates: currentRates.map((rate) => rate.country).join(', '),
    });

    const listOfCountriesUsedInTheProject = (
      await ctClient
        .get()
        .execute()
        .catch((result) => result)
    ).body.countries;

    const desiredRates =
      listOfCountriesUsedInTheProject?.map((countryCode) => {
        return {
          name: 'coupon',
          amount: 0,
          country: countryCode,
          includedInPrice: true,
        };
      }) ?? [];

    const { ratesToAdd, ratesToDelete, ratesToUpdate } =
      this.calcOperationsToGetDesiredRates(desiredRates, currentRates);

    const actions = [
      ...ratesToAdd.map(
        (taxRate) =>
          ({
            action: 'addTaxRate',
            taxRate,
          } as TaxCategoryAddTaxRateAction),
      ),
      ...ratesToDelete.map(
        (taxRate) =>
          ({
            action: 'removeTaxRate',
            taxRateId: taxRate.id,
          } as TaxCategoryRemoveTaxRateAction),
      ),
      ...ratesToUpdate.map(
        (taxRate) =>
          ({
            action: 'replaceTaxRate',
            taxRateId: currentRates.find(
              (rate_) => rate_.country === taxRate.country,
            ).id,
            taxRate,
          } as TaxCategoryReplaceTaxRateAction),
      ),
    ];

    this.logger.debug({
      msg: 'Calculated updates for countries in coupon tax categories:',
      actions,
    });

    if (!actions.length) {
      return couponTaxCategory;
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
      .execute()
      .catch((result) => result);

    const success = [200, 201].includes(response.statusCode);
    if (success) {
      this.logger.debug({ msg: 'Updated countries for coupon tax category' });
    } else {
      const msg = 'Could not update countries for coupon tax category';
      this.logger.error({
        msg,
      });
    }

    return this.getCashedCouponTaxCategoryOrFromNewRequest();
  }

  public async unconfigureCouponTaxCategory(): Promise<{ success: boolean }> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const couponTaxCategory =
      await this.getCashedCouponTaxCategoryOrFromNewRequest();

    const response = await ctClient
      .taxCategories()
      .withId({ ID: couponTaxCategory.id })
      .delete({
        queryArgs: {
          version: couponTaxCategory.version,
        },
      })
      .execute()
      .catch((result) => result);

    const success = [200, 201].includes(response.statusCode);
    if (success) {
      this.logger.debug({ msg: 'Deleted coupon tax category' });
      return { success: true };
    }
    const msg = 'Could not delete coupon tax category';
    this.logger.error({
      msg,
    });
    return { success: false };
  }

  private calcOperationsToGetDesiredRates(
    desiredRates: TaxRate[],
    currentRates: TaxRate[],
  ) {
    const ratesToAdd = desiredRates?.filter(
      (rate) =>
        !currentRates?.map((rate_) => rate_.country).includes(rate.country),
    );

    const ratesToUpdate = desiredRates.filter((desiredRate) => {
      const currentRate = currentRates.find(
        (currentRate) => currentRate.country === desiredRate.country,
      );
      return (
        currentRate &&
        (currentRate.amount !== desiredRate.amount ||
          currentRate.includedInPrice !== desiredRate.includedInPrice)
      );
    });

    const ratesToDelete = currentRates?.filter(
      (rate) =>
        !desiredRates.map((rate_) => rate_.country).includes(rate.country),
    );
    return { ratesToAdd, ratesToDelete, ratesToUpdate };
  }

  public async addCountryToCouponTaxCategory(
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
      .execute()
      .catch((result) => result);
    const success = [200, 201].includes(response.statusCode);
    if (success) {
      this.couponTaxCategory = null;
      this.logger.debug({ msg: 'Added country to coupon tax category' });
      await this.getCashedCouponTaxCategoryOrFromNewRequest();
    } else {
      this.logger.error({
        msg: 'Could not add country to coupon tax category',
      });
    }
    return success;
  }
}
