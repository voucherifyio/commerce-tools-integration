import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import { TaxCategory } from '@commercetools/platform-sdk';
import { ProductsService } from '../products/products.service';

@Injectable()
export class TaxCategoriesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly productsService: ProductsService,
  ) {}

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

    const listOfCountriesUsedInAllProducts =
      await this.productsService.getListOfCountriesUsedInProducts();

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
      await ctClient
        .taxCategories()
        .withId({ ID: couponTaxCategory.id })
        .post({
          body: {
            version: couponTaxCategory.version,
            actions: [],
          },
        })
        .execute();
    }

    return { success: true, couponTaxCategory: couponTaxCategory };
  }

  async addCountryToCouponTaxCategory(
    taxCategory: TaxCategory,
    countryCode: string,
  ) {
    const ctClient = this.commerceToolsConnectorService.getClient();
    return await ctClient
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
  }
}
