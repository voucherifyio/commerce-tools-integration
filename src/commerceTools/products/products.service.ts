import { Injectable, Logger } from '@nestjs/common';
import { Product } from '@commercetools/platform-sdk';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly logger: Logger,
  ) {}

  async getListOfCountriesUsedInProducts({
    onProgress,
  }: {
    onProgress?: (progress: number) => void;
  }): Promise<string[]> {
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

    for await (const product of this.getAllProducts({ onProgress })) {
      addValueToCountriesIfKeyFound(product, 'country');
    }
    const countiresArr = [...countries];
    this.logger.debug({
      msg: 'All countries set for products',
      countries: countiresArr.join(','),
    });
    return countiresArr;
  }

  async *getAllProducts({
    onProgress,
  }: {
    onProgress?: (progress: number) => void;
  }): AsyncGenerator<Product[]> {
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
      if (typeof onProgress === 'function') {
        onProgress((limit * page) / productResult.body.total);
      }
      this.logger.debug({
        msg: 'iterating over all products',
        products: limit * page,
        total: productResult.body.total,
      });
    } while (!allProductsCollected);
  }
}
