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

  private async *getAllProducts(
    fetchPeriod?: number,
  ): AsyncGenerator<Product[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 10;
    let page = 265;
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

    const date = new Date();
    if (fetchPeriod) {
      date.setDate(date.getDate() - fetchPeriod);
    }

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
            ...(fetchPeriod && {
              where: `lastModifiedAt>="${date.toJSON()}" or createdAt>="${date.toJSON()}"`,
            }),
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

  private async productImport(period?: number) {
    const products = [];
    const skus = [];

    for await (const productsBatch of this.getAllProducts(period)) {
      productsBatch.forEach((product) => {
        products.push({
          name: product.masterData.current.name.en,
          source_id: product.id,
        });
        
        if(product.masterData.current.variants.length) {
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
        } else {
          skus.push({
            product_id: product.id,
            sku: product.masterData.current.name.en,
            source_id: product.masterData.current.masterVariant.sku,
            price:
              product.masterData.current.masterVariant.price.value.centAmount /
              100,
          })
        }
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
      (err) => this.logger.error(err),
    );

    return result;
  }

  private async waitUntilDone(asyncActionId) {
    const headers = {
      'X-App-Id': this.configService.get<string>('VOUCHERIFY_APP_ID'),
      'X-App-Token': this.configService.get<string>('VOUCHERIFY_SECRET_KEY'),
    };
    let status = 'IN_PROGRESS';
    let result = null;

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
      result = responseJson.result;

      this.logger.info(`Processing status: ${status}`);
    } while (
      status === 'IN_PROGRESS' ||
      status === null ||
      status === undefined
    );

    return result;
  }

  public async migrateProducts(period?: number) {
    const { products, skus } = await this.productImport(period);

    const productResult = await this.productUpload(products, 'products');
    this.logger.info(
      `Products are processing by Voucherify. It may take a few minutes. Async action id coupled with product import: ${productResult.async_action_id}`,
    );
    const productUploadStatus = await this.waitUntilDone(
      productResult.async_action_id,
    );
    this.logger.info('Products were processed');

    if (productUploadStatus.failed.length === 0) {
      const skusResult = await this.productUpload(skus, 'skus');
      this.logger.info(
        `Skus are processing by Voucherify. It may take a few minutes. Async action id coupled with skus import: ${skusResult.async_action_id}`,
      );
      const skusUploadStatus = await this.waitUntilDone(
        skusResult.async_action_id,
      );
      this.logger.info('Skus were processed');

      return skusUploadStatus.failed.length === 0
        ? { success: true }
        : { success: false };
    }

    return { success: false };
  }
}
