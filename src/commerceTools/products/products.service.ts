import { Injectable } from '@nestjs/common';
import { Product } from '@commercetools/platform-sdk';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  async getListOfCountriesUsedInProducts(): Promise<string[]> {
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

    for await (const product of this.getAllProducts()) {
      addValueToCountriesIfKeyFound(product, 'country');
    }
    return [...countries];
  }

  async *getAllProducts(): AsyncGenerator<Product[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    let page = 0;
    let allProductsCollected = false;

    do {
      const productResult = await ctClient
        .products()
        .get({ queryArgs: { limit: limit, offset: page * limit } })
        .execute();
      yield productResult.body.results;
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
  }
}
