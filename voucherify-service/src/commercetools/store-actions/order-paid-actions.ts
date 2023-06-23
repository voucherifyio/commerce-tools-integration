import { Payment } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Order as CommerceToolsOrder } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { CUSTOM_FIELD_PREFIX } from '../../consts/voucherify';
import { deleteObjectsFromObject } from '../utils/deleteObjectsFromObject';
import flatten from 'flat';

const CUSTOM_FIELD_PREFIX_LENGTH = CUSTOM_FIELD_PREFIX.length;

const getOrderMetadata = (order, customMetadataProperties) => {
  if (!(order?.custom?.fields && customMetadataProperties.length)) {
    return {};
  }
  return customMetadataProperties
    .filter(
      (key) => order.custom.fields?.[key.slice(CUSTOM_FIELD_PREFIX_LENGTH)],
    )
    .reduce((accumulator, key) => {
      const variable =
        order.custom.fields[key.slice(CUSTOM_FIELD_PREFIX_LENGTH)];
      if (typeof variable !== 'object') {
        accumulator[key] = variable;
        return;
      }
      if (Array.isArray(variable)) {
        accumulator[key] = variable.map((element) => {
          if (typeof element !== 'object') {
            return element;
          }
          return deleteObjectsFromObject(flatten(element));
        });
        return;
      }
      if (typeof variable === 'object') {
        accumulator[key] = deleteObjectsFromObject(flatten(variable));
        return;
      }
      return;
    }, {});
};

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

    const metadata = getOrderMetadata(order, customMetaProperties);

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

    // orderMetadataSchemaProperties
    //     .filter(
    //         (key) =>
    //             key !== 'payments' &&
    //             key.slice(0, CUSTOM_FIELD_PREFIX_LENGTH) !== CUSTOM_FIELD_PREFIX,
    //     )
    //     .forEach((key) => {
    //       if (order[key]) {
    //         addToMataData(order[key], key);
    //       }
    //     });

    return metadata;
  }
}
