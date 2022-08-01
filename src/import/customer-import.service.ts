import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, unlink } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch2';
import { CommerceToolsConnectorService } from 'src/commerceTools/commerce-tools-connector.service';
import { Customer } from '@commercetools/platform-sdk';
import ObjectsToCsv from 'objects-to-csv';
import { VoucherifyConnectorService } from 'src/voucherify/voucherify-connector.service';
import crypto = require('crypto');

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
@Injectable()
export class CustomerImportService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly voucherifyClient: VoucherifyConnectorService,
  ) {}

  private async *getAllCustomers(
    fetchPeriod?: number,
  ): AsyncGenerator<Customer[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 100;
    let page = 0;
    let allCustomersCollected = false;

    const date = new Date();
    if (fetchPeriod) {
      date.setDate(date.getDate() - fetchPeriod);
    }

    do {
      const customerResult = await ctClient
        .customers()
        .get({
          queryArgs: {
            limit: limit,
            offset: page * limit,
            ...(fetchPeriod && {
              where: `lastModifiedAt>="${date.toJSON()}" or createdAt>="${date.toJSON()}"`,
            }),
          },
        })
        .execute();
      yield customerResult.body.results;
      page++;
      if (customerResult.body.total < page * limit) {
        allCustomersCollected = true;
      }
    } while (!allCustomersCollected);
  }

  private async customerImport(period?: number) {
    const metadataSchemaProperties =
      await this.voucherifyClient.getMetadataSchemaProperties('customer');
    const customers = [];

    for await (const customersBatch of this.getAllCustomers(period)) {
      customersBatch.forEach((customer) => {
        customers.push({
          object: 'customer',
          source_id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          address: customer.addresses.length ?? {
            city: customer.addresses[0].city,
            country: customer.addresses[0].country,
            postal_code: customer.addresses[0].postalCode,
            line_1: customer.addresses[0].streetName,
          },
          phone: customer.addresses.length ?? customer.addresses[0].phone,
          ...Object.fromEntries(
            Object.keys(customer.custom?.fields ? customer.custom?.fields : {})
              .filter((attr) => metadataSchemaProperties.includes(attr))
              .map((attr) => [attr, customer.custom.fields[attr]]),
          ),
        });
      });
    }

    return { customers };
  }

  private async customerUpload(importedData) {
    const randomFileName = `${crypto.randomBytes(20).toString('hex')}.csv`;
    await new ObjectsToCsv(importedData).toDisk(randomFileName, {
      allColumns: true,
    });
    const url = `${this.configService.get<string>(
      'VOUCHERIFY_API_URL',
    )}/v1/customers/importCSV`;

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

  public async migrateCustomers(period?: number) {
    const { customers } = await this.customerImport(period);

    const customerResult = await this.customerUpload(customers);
    this.logger.debug(
      `Customers are processing by Voucherify. It may take a few minutes. Async action id coupled with customer import: ${customerResult.async_action_id}`,
    );
    const customerUploadStatus = await this.waitUntilDone(
      customerResult.async_action_id,
    );
    this.logger.debug('Customers were processed');

    return customerUploadStatus.failed.length === 0
      ? { success: true }
      : { success: false };
  }
}
