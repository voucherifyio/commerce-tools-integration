import { Payment } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Order as CommerceToolsOrder } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { CUSTOM_FIELD_PREFIX } from '../../consts/voucherify';
import { deleteObjectsFromObject } from '../utils/deleteObjectsFromObject';
import flatten from 'flat';

const CUSTOM_FIELD_PREFIX_LENGTH = CUSTOM_FIELD_PREFIX.length;

const addToMetadataReduceFunction = (accumulator, key, variable) => {
  if (typeof variable !== 'object') {
    accumulator[key] = variable;
  } else if (Array.isArray(variable)) {
    accumulator[key] = variable.map((element) => {
      if (typeof element !== 'object') {
        return element;
      }
      return deleteObjectsFromObject(flatten(element));
    });
  } else if (typeof variable === 'object') {
    accumulator[key] = deleteObjectsFromObject(flatten(variable));
  }
  return accumulator;
};

const getOrderMetadataFromCustomFields = (
  order,
  orderMetadataSchemaProperties,
) => {
  const customMetadataProperties = orderMetadataSchemaProperties.filter(
    (key) =>
      key.length > CUSTOM_FIELD_PREFIX_LENGTH &&
      key.slice(0, CUSTOM_FIELD_PREFIX_LENGTH) === CUSTOM_FIELD_PREFIX,
  );
  if (!(order?.custom?.fields && customMetadataProperties.length)) {
    return {};
  }
  return customMetadataProperties
    .filter(
      (key) => order.custom.fields?.[key.slice(CUSTOM_FIELD_PREFIX_LENGTH)],
    )
    .reduce(
      (accumulator, key) =>
        addToMetadataReduceFunction(
          accumulator,
          key,
          order.custom.fields[key.slice(CUSTOM_FIELD_PREFIX_LENGTH)],
        ),
      {},
    );
};

const getOrderMetadata = (order, metadataProperties) => {
  return metadataProperties
    .filter(
      (key) =>
        key !== 'payments' &&
        key.slice(0, CUSTOM_FIELD_PREFIX_LENGTH) !== CUSTOM_FIELD_PREFIX,
    )
    .reduce(
      (accumulator, key) =>
        addToMetadataReduceFunction(accumulator, key, order[key]),
      {},
    );
};

export class OrderPaidActions implements OrderPaidActions {
  private ctClient: ByProjectKeyRequestBuilder;

  public setCtClient(value: ByProjectKeyRequestBuilder) {
    this.ctClient = value;
  }

  public async findPayment(id: string): Promise<Payment> {
    return (
      await this.ctClient
        .payments()
        .withId({ ID: id })
        .get()
        .execute()
        .catch((result) => result)
    )?.body;
  }

  public async getCustomMetadataForOrder(
    order: CommerceToolsOrder,
    orderMetadataSchemaProperties: string[],
  ): Promise<{ [key: string]: string }> {
    const metadata = {
      ...getOrderMetadataFromCustomFields(order, orderMetadataSchemaProperties),
      ...getOrderMetadata(order, orderMetadataSchemaProperties),
    };

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

    return metadata;
  }
}
