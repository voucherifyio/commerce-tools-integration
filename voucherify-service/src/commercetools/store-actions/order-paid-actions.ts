import { Payment } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Order as CommerceToolsOrder } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { CUSTOM_FIELD_PREFIX } from '../../consts/voucherify';
import { deleteObjectsFromObject } from '../utils/deleteObjectsFromObject';
import flatten from 'flat';

const CUSTOM_FIELD_PREFIX_LENGTH = CUSTOM_FIELD_PREFIX.length;

export class OrderPaidActions implements OrderPaidActions {
  private ctClient: ByProjectKeyRequestBuilder;
  public setCtClient(value: ByProjectKeyRequestBuilder) {
    this.ctClient = value;
  }

  public async findPayment(id: string): Promise<Payment> {
    return (await this.ctClient.payments().withId({ ID: id }).get().execute())
      ?.body;
  }

  public async getCustomMetadataForOrder(
    order: CommerceToolsOrder,
    orderMetadataSchemaProperties: string[],
  ): Promise<{ [key: string]: string }> {
    const customMetaProperties = orderMetadataSchemaProperties.filter(
      (key) =>
        key.length > CUSTOM_FIELD_PREFIX_LENGTH &&
        key.slice(0, CUSTOM_FIELD_PREFIX_LENGTH) === CUSTOM_FIELD_PREFIX,
    );

    const metadata = {};

    const addToMataData = (variable: any, name: string) => {
      if (typeof variable !== 'object') {
        return (metadata[name] = variable);
      }
      if (Array.isArray(variable)) {
        const newArray = [];
        variable.forEach((element) => {
          if (typeof variable !== 'object') {
            newArray.push(element);
          } else {
            newArray.push(deleteObjectsFromObject(flatten(element)));
          }
        });
        return (metadata[name] = newArray);
      }
      if (typeof variable === 'object') {
        return (metadata[name] = deleteObjectsFromObject(flatten(variable)));
      }
      return;
    };

    if (order?.custom?.fields && customMetaProperties.length) {
      customMetaProperties.forEach((key) => {
        if (order.custom.fields?.[key.slice(CUSTOM_FIELD_PREFIX_LENGTH)]) {
          addToMataData(
            order.custom.fields[key.slice(CUSTOM_FIELD_PREFIX_LENGTH)],
            key,
          );
        }
      });
    }

    if (orderMetadataSchemaProperties.includes('payments')) {
      const payments = [];
      const paymentReferences = order?.paymentInfo?.payments ?? [];
      for await (const paymentReference of paymentReferences) {
        payments.push(await this.findPayment(paymentReference.id));
      }
      metadata['payments'] = payments
        .filter((payment) => payment?.id)
        .map((payment) => deleteObjectsFromObject(flatten(payment)));
    }

    orderMetadataSchemaProperties
      .filter(
        (key) =>
          key !== 'payments' &&
          key.slice(0, CUSTOM_FIELD_PREFIX_LENGTH) !== CUSTOM_FIELD_PREFIX,
      )
      .forEach((key) => {
        if (order[key]) {
          metadata[key] = order[key];
        }
      });
    return metadata;
  }
}
