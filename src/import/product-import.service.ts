import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const { createReadStream, unlink } = require('fs');
const FormData = require('form-data');
import fetch from 'node-fetch2';
import { CommerceToolsConnectorService } from 'src/commerceTools/commerce-tools-connector.service';
import { Product } from '@commercetools/platform-sdk';
const ObjectsToCsv = require('objects-to-csv');

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
@Injectable()
export class ProductImport {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly configService: ConfigService,
  ) {}

  private async *getAllProducts(): AsyncGenerator<Product[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    let page = 0;
    let allProductsCollected = false;

    do {
      const productResult = await ctClient
        .products()
        .get({
          queryArgs: {
            limit: limit,
            offset: page * limit,
            priceCurrency: 'EUR',
            priceCountry: 'DE',
          },
        })
        .execute();
      yield productResult.body.results;
      page++;
      if (productResult.body.total < page * limit) {
        allProductsCollected = true;
      }
    } while (!allProductsCollected);
  }

  private async productImport() {
    const products = [];
    const skus = [];

    for await (const productsBatch of this.getAllProducts()) {
      productsBatch.forEach((product) => {
        products.push({
          name: product.masterData.current.name.en,
          source_id: product.id,
        });
        product.masterData.current.variants.forEach((variant) => {
          skus.push({
            product_id: product.id,
            sku: product.masterData.current.name.en,
            source_id: variant.sku,
            price:
              product.masterData.current.masterVariant.price.value.centAmount /
              100,
          });
        });
      });
    }

    return { products, skus };
  }

  private async productUpload(importedData, dataType: 'products' | 'skus') {
    await new ObjectsToCsv(importedData).toDisk(
      dataType === 'products' ? 'productsCsv.csv' : 'skusCsv.csv',
    );
    const url = `${this.configService.get<string>('VOUCHERIFY_API_URL')}/v1/${
      dataType === 'products' ? 'products' : 'skus'
    }/importCSV`;

    const headers = {
      'X-App-Id': this.configService.get<string>('VOUCHERIFY_APP_ID'),
      'X-App-Token': this.configService.get<string>('VOUCHERIFY_SECRET_KEY'),
      Accept: '*/*',
    };

    const stream = createReadStream(
      dataType === 'products' ? 'productsCsv.csv' : 'skusCsv.csv',
    );
    const form = new FormData();
    form.append('file', stream);

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: form,
    });
    const result = await response.json();

    unlink(
      dataType === 'products' ? 'productsCsv.csv' : 'skusCsv.csv',
      (err) => err || console.log(err),
    );

    return result;
  }

  private async checkIfDone(asyncActionId) {
    const headers = {
      'X-App-Id': this.configService.get<string>('VOUCHERIFY_APP_ID'),
      'X-App-Token': this.configService.get<string>('VOUCHERIFY_SECRET_KEY'),
    };
    let status = 'IN_PROGRESS';

    do {
      await sleep(10000);
      const response = await fetch(
        `${this.configService.get<string>(
          'VOUCHERIFY_API_URL',
        )}/v1/async-actions/${asyncActionId}`,
        { method: 'GET', headers: headers },
      );
      const responseJson = await response.json();
      status = responseJson.status;
      console.log(status);
    } while (
      status === 'IN_PROGRESS' ||
      status === null ||
      status === undefined
    );

    return status;
  }

  public async migrateProducts() {
    const { products, skus } = await this.productImport();

    const productResult = await this.productUpload(products, 'products');
    const skusResult = await this.productUpload(skus, 'skus');

    const productUploadStatus = this.checkIfDone(productResult.async_action_id);
    const skusUploadStatus = this.checkIfDone(skusResult.async_action_id);

    return { productUploadStatus, skusUploadStatus };
  }
}
