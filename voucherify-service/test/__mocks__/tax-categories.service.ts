import { TaxCategory } from '@commercetools/platform-sdk';
import { TaxCategoriesService } from '../../src/commercetools/tax-categories/tax-categories.service';

const taxRateForCountry = (country) => ({
  name: 'coupon',
  amount: 0,
  includedInPrice: true,
  country: country,
  id: `sometax${country}`,
  subRates: [],
});

const COUNTRIES = [
  'US',
  'DE',
  'IT',
  'GB',
  'BE',
  'BG',
  'DK',
  'EE',
  'FI',
  'FR',
  'GR',
  'IE',
  'HR',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'AT',
  'PL',
  'PT',
  'RO',
  'SE',
  'SK',
  'SI',
  'ES',
  'CZ',
  'HU',
  'CY',
];

export const defaultGetCouponTaxCategoryResponse = {
  id: '64a3b50d-245c-465a-bb5e-faf59d729031',
  version: 30,
  createdAt: '2022-07-06T10:31:15.807Z',
  lastModifiedAt: '2022-07-06T10:31:46.488Z',
  lastModifiedBy: {
    clientId: 'S7ikAUxscunVOCl_qQ1uUzLP',
    isPlatformClient: false,
  },
  createdBy: {
    clientId: 'S7ikAUxscunVOCl_qQ1uUzLP',
    isPlatformClient: false,
  },
  name: 'coupon',
  rates: COUNTRIES.map((country) => taxRateForCountry(country)),
} as TaxCategory;

export const getTaxCategoryServiceMockWithConfiguredTaxCategoryResponse =
  () => {
    const taxCategoriesService = jest.createMockFromModule(
      '../../src/commercetools/tax-categories/tax-categories.service',
    ) as TaxCategoriesService;

    taxCategoriesService.getCouponTaxCategoryAndUpdateItIfNeeded = jest
      .fn()
      .mockResolvedValue(defaultGetCouponTaxCategoryResponse);

    taxCategoriesService.addCountryToCouponTaxCategory = jest.fn();

    return taxCategoriesService;
  };

export const getTaxCategoryServiceMockWithNotDefinedTaxCategoryResponse =
  () => {
    const taxCategoriesService = jest.createMockFromModule(
      '../../src/commercetools/tax-categories/tax-categories.service',
    ) as TaxCategoriesService;

    taxCategoriesService.addCountryToCouponTaxCategory = jest.fn();

    return taxCategoriesService;
  };
