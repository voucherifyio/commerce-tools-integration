import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, unlink } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch2';
import { CommerceToolsConnectorService } from 'src/commerceTools/commerce-tools-connector.service';
import { Product } from '@commercetools/platform-sdk';
import ObjectsToCsv from 'objects-to-csv';

import crypto = require('crypto');
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import { ProductMapper } from '../api-extension/mappers/product';

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
@Injectable()
export class ProductImportService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly voucherifyClient: VoucherifyConnectorService,
    private readonly productMapper: ProductMapper,
  ) {}

  private async *getAllProducts(
    minDateTime?: string,
  ): AsyncGenerator<Product[]> {
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
            ...(minDateTime && {
              where: `lastModifiedAt>="${minDateTime}" or createdAt>="${minDateTime}"`,
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

  private async productImport(period?: string) {
    const metadataSchemaProperties =
      await this.voucherifyClient.getMetadataSchemaProperties('product');

    const products = [];
    const skus = [];

    for await (const productsBatch of this.getAllProducts(period)) {
      productsBatch.forEach((product) => {
        products.push({
          name: product.masterData.current.name.en,
          source_id: product.id,
          ...this.productMapper.getMetadata(
            product.masterData.current.masterVariant.attributes,
            metadataSchemaProperties,
          ),
        });

        if (product.masterData.current.variants.length) {
          product.masterData.current.variants.forEach((variant) => {
            skus.push({
              product_id: product.id,
              sku: product.masterData.current.name.en,
              source_id: variant.sku,
              price:
                product.masterData.current.masterVariant.price.value
                  .centAmount / 100,
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
          });
        }
      });
    }

    return { products, skus };
  }

  private async productUpload(importedData, dataType: 'products' | 'skus') {
    const randomFileName = `${crypto.randomBytes(20).toString('hex')}.csv`;
    await new ObjectsToCsv(importedData).toDisk(randomFileName, {
      allColumns: true,
    });
    const url = `${this.configService.get<string>('VOUCHERIFY_API_URL')}/v1/${
      dataType === 'products' ? 'products' : 'skus'
    }/importCSV`;

    const headers = {
      'X-App-Id': this.configService.get<string>('VOUCHERIFY_APP_ID'),
      'X-App-Token': this.configService.get<string>('VOUCHERIFY_SECRET_KEY'),
      Accept: '*/*',
    };

    const stream = createReadStream(randomFileName);
    const form = new FormData();
    form.append('file', stream);

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: form,
    });
    const result = await response.json();

    unlink(randomFileName, (err) => {
      if (err) {
        this.logger.error(err);
      }
    });

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
      const response = await fetch(
        `${this.configService.get<string>(
          'VOUCHERIFY_API_URL',
        )}/v1/async-actions/${asyncActionId}`,
        { method: 'GET', headers: headers },
      );
      const responseJson = await response.json();
      status = responseJson.status;
      result = responseJson.result;

      this.logger.debug(`Processing status: ${status}`);
    } while (
      (status === 'IN_PROGRESS' || status === null || status === undefined) &&
      (await sleep(20000))
    );

    return result;
  }

  public async migrateProducts(period?: string) {
    const { products, skus } = await this.productImport(period);

    const productResult = await this.productUpload(products, 'products');
    this.logger.debug(
      `Products are processing by Voucherify. It may take a few minutes. Async action id coupled with product import: ${productResult.async_action_id}`,
    );
    const productUploadStatus = await this.waitUntilDone(
      productResult.async_action_id,
    );
    this.logger.debug('Products were processed');

    if (productUploadStatus.failed.length === 0) {
      const skusResult = await this.productUpload(skus, 'skus');
      this.logger.debug(
        `Skus are processing by Voucherify. It may take a few minutes. Async action id coupled with skus import: ${skusResult.async_action_id}`,
      );
      const skusUploadStatus = await this.waitUntilDone(
        skusResult.async_action_id,
      );
      this.logger.debug('Skus were processed');

      return skusUploadStatus.failed.length === 0
        ? { success: true }
        : { success: false };
    }

    return { success: false };
  }
}
