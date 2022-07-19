import { TaxCategory } from '@commercetools/platform-sdk';
import { TaxCategoriesService } from '../tax-categories.service';

interface MockedTaxCategoriesService extends TaxCategoriesService {
  __simulateDefaultGetCouponTaxCategories: () => void;
  __simulateCouponTaxCategoryIsNotDefined: () => void;
}

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

const defaultGetCouponTaxCategoryResponse = {
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

const taxCategoriesService = jest.createMockFromModule(
  '../tax-categories.service',
) as MockedTaxCategoriesService;

taxCategoriesService.__simulateDefaultGetCouponTaxCategories = () => {
  taxCategoriesService.getCouponTaxCategory = jest.fn(() =>
    Promise.resolve(defaultGetCouponTaxCategoryResponse),
  );
};

taxCategoriesService.__simulateCouponTaxCategoryIsNotDefined = () => {
  taxCategoriesService.getCouponTaxCategory = jest.fn(() =>
    Promise.resolve(null),
  );
};

taxCategoriesService.__simulateDefaultGetCouponTaxCategories();
taxCategoriesService.addCountryToCouponTaxCategory = jest.fn();

export {
  defaultGetCouponTaxCategoryResponse,
  taxCategoriesService as TaxCategoriesService,
  MockedTaxCategoriesService,
};
