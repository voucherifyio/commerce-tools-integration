import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, unlink } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch2';
import { CommerceToolsConnectorService } from 'src/commerceTools/commerce-tools-connector.service';
import { Product } from '@commercetools/platform-sdk';
import ObjectsToCsv from 'objects-to-csv';
import { JsonLogger, LoggerFactory } from 'json-logger-service';

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
@Injectable()
export class ProductImportService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    ProductImportService.name,
  );

  private async *getAllProducts(): AsyncGenerator<Product[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    let page = 0;
    let allProductsCollected = false;

    const currency = this.configService.get<string>(
      'COMMERCE_TOOLS_PRODUCTS_CURRENCY',
    );
    const country = this.configService.get<string>(
      'COMMERCE_TOOLS_PRODUCTS_COUNTRY',
    );
    const channel = this.configService.get<string>(
      'COMMERCE_TOOLS_PRODUCT_CHANNEL',
    );
    const customerGroup = this.configService.get<string>(
      'COMMERCE_TOOLS_PRODUCT_CUSTOMER_GROUP',
    );

    do {
      const productResult = await ctClient
        .products()
        .get({
          queryArgs: {
            limit: limit,
            offset: page * limit,
            priceCurrency: currency,
            priceCountry: country,
            priceCustomerGroup: customerGroup,
            priceChannel: channel,
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

    this.logger.info(
      'Products are processing by Voucherify. It may take a few minutes',
    );

    do {
      await sleep(20000);
      const response = await fetch(
        `${this.configService.get<string>(
          'VOUCHERIFY_API_URL',
        )}/v1/async-actions/${asyncActionId}`,
        { method: 'GET', headers: headers },
      );
      const responseJson = await response.json();
      status = responseJson.status;

      this.logger.info(`Processing status: ${status}`);
    } while (
      status === 'IN_PROGRESS' ||
      status === null ||
      status === undefined
    );

    this.logger.info('Products were processed');

    return status;
  }

  public async migrateProducts() {
    const { products, skus } = await this.productImport();

    const productResult = await this.productUpload(products, 'products');
    const skusResult = await this.productUpload(skus, 'skus');

    const productUploadStatus = await this.checkIfDone(
      productResult.async_action_id,
    );
    const skusUploadStatus = await this.checkIfDone(skusResult.async_action_id);

    // return { productUploadStatus, skusUploadStatus };
    if (productUploadStatus === 'DONE' && skusUploadStatus === 'DONE') {
      return { success: true };
    } else {
      return { success: false };
    }
  }
}
