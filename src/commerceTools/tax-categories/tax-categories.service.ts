import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import { TaxCategory } from '@commercetools/platform-sdk';

@Injectable()
export class TaxCategoriesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {
    this.getAllTaxCategories();
  }

  //coupon tax category not included
  async getListOfCountriesUsedInTaxCategories(): Promise<string[]> {
    const allTaxCategories = await this.getAllTaxCategories();
    return [
      ...new Set(
        allTaxCategories
          .filter((taxCategory) => taxCategory.name !== 'coupon')
          .map((taxCategory) => taxCategory.rates.map((rate) => rate.country))
          .flat(),
      ),
    ];
  }

  async getAllTaxCategories(): Promise<TaxCategory[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const taxCategories = await ctClient
      .taxCategories()
      .get({ queryArgs: { limit: 100 } })
      .execute();
    return taxCategories.body.results;
  }

  async getCouponTaxCategory(): Promise<TaxCategory> {
    const taxCategories = await this.getAllTaxCategories();
    const couponTaxCategory = taxCategories.find(
      (taxCategory) => taxCategory.name === 'coupon',
    );
    if (!couponTaxCategory) return null;
    return couponTaxCategory;
  }

  async configureCouponTaxCategory(): Promise<{
    success: boolean;
    couponTaxCategory: TaxCategory;
  }> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const couponTaxCategoryResult = await this.getCouponTaxCategory();
    let couponTaxCategory;
    if (!couponTaxCategoryResult) {
      couponTaxCategory = await ctClient
        .taxCategories()
        .post({
          body: {
            name: 'coupon', //DO NOT change coupon name
            rates: [],
          },
        })
        .execute();
    } else {
      couponTaxCategory = couponTaxCategoryResult;
    }
    const rates = couponTaxCategory?.rates;

    const listOfCountriesUsedInTaxCategories =
      await this.getListOfCountriesUsedInTaxCategories();
    const desiredRates = listOfCountriesUsedInTaxCategories.map(
      (countryCode) => {
        return {
          name: 'coupon',
          amount: 0,
          country: countryCode,
          includedInPrice: true,
        };
      },
    );

    const ratesToAdd = desiredRates.filter(
      (rate) => !rates.map((rate_) => rate_.country).includes(rate.country),
    );
    const ratesToUpdate = desiredRates.filter((rate) =>
      rates.map((rate_) => rate_.country).includes(rate.country),
    );
    const ratesToDelete = rates.filter(
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
    if (actions.length) {
      couponTaxCategory = await ctClient
        .taxCategories()
        .withId(couponTaxCategory.id)
        .post({
          body: {
            version: couponTaxCategory.version,
            actions: actions,
          },
        });
    }
    return { success: true, couponTaxCategory: couponTaxCategory };
  }
}
