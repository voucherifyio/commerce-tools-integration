import { Injectable } from '@nestjs/common';
import { Product } from '@commercetools/platform-sdk';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  async getListOfCountriesUsedInProducts(): Promise<string[]> {
    const allProducts = await this.getAllProducts();
    const countries: Set<string> = new Set();

    const addValueToCountriesIfKeyFound = (e: object, key: string) => {
      if (!!e && typeof e === 'object')
        for (const f of Object.keys(e)) {
          if (typeof e[f] === 'object') {
            addValueToCountriesIfKeyFound(e[f], key);
          }
          if (f === key) {
            countries.add(e[key]);
          }
        }
      return e;
    };

    for (const product of allProducts) {
      addValueToCountriesIfKeyFound(product, 'country');
    }

    return [...countries];
  }

  async getAllProducts(): Promise<Product[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    const allTypes = [];
    let page = 0;
    let allProductsCollected = false;

    do {
      const productResult = await ctClient
        .products()
        .get({ queryArgs: { limit: limit, offset: page * limit } })
        .execute();
      allTypes.push(...productResult.body.results);
      page++;
      if (productResult.body.total < page * limit) {
        allProductsCollected = true;
      }
      console.log(
        `${
          productResult.body.total > page * limit
            ? limit * page
            : productResult.body.total
        }/${productResult.body.total} products`,
      );
    } while (!allProductsCollected);

    return allTypes.flat();
  }
}
