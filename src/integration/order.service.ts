import { Injectable, Logger } from '@nestjs/common';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { Order } from '@commercetools/platform-sdk';
import { desarializeCoupons, Coupon } from './coupon';
import { OrderMapper } from './mappers/order';
import { ProductMapper } from './mappers/product';
import { RedemptionsRedeemStackableResponse } from '@voucherify/sdk';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import flatten from 'flat';
import { deleteObjectsFromObject } from '../misc/deleteObjectsFromObject';

type SentCoupons = {
  result: string;
  coupon: string;
};

const CUSTOM_FIELD_PREFIX = 'custom_filed_';

@Injectable()
export class OrderService {
  constructor(
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly logger: Logger,
    private readonly orderMapper: OrderMapper,
    private readonly productMapper: ProductMapper,
  ) {}

  public async getMetadataForOrder(
    order: Order,
    allMetadataSchemaProperties: string[],
  ) {
    const standardMetaProperties = allMetadataSchemaProperties.filter(
      (key) => !key.includes(CUSTOM_FIELD_PREFIX),
    );
    const customMetaProperties = allMetadataSchemaProperties.filter(
      (key) =>
        key.length > CUSTOM_FIELD_PREFIX.length &&
        key.slice(0, CUSTOM_FIELD_PREFIX.length) === CUSTOM_FIELD_PREFIX,
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
          }
          if (!Array.isArray(variable)) {
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

    standardMetaProperties.forEach((key) => {
      if (order[key]) {
        addToMataData(order[key], key);
      }
    });

    if (order?.custom?.fields && customMetaProperties.length) {
      customMetaProperties.forEach((key) => {
        if (order.custom.fields?.[key.slice(CUSTOM_FIELD_PREFIX.length)]) {
          addToMataData(
            order.custom.fields[key.slice(CUSTOM_FIELD_PREFIX.length)],
            key,
          );
        }
      });
    }

    if (standardMetaProperties.find((key) => key === 'payments')) {
      const payments = [];
      const paymentReferences = order?.paymentInfo?.payments ?? [];
      for await (const paymentReference of paymentReferences) {
        payments.push(
          await this.commerceToolsConnectorService.findPayment(
            paymentReference.id,
          ),
        );
      }
      metadata['payments'] = payments
        .filter((payment) => payment?.id)
        .map((payment) => deleteObjectsFromObject(flatten(payment)));
    }

    return metadata;
  }

  public async redeemVoucherifyCoupons(order: Order) {
    const { id, customerId } = order;

    const orderMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'order',
      );

    const productMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'product',
      );
    const orderMetadata = await this.getMetadataForOrder(
      order,
      orderMetadataSchemaProperties,
    );

    const items = this.productMapper.mapLineItems(
      order.lineItems,
      productMetadataSchemaProperties,
    );

    const coupons: Coupon[] = (order.custom?.fields?.discount_codes ?? [])
      .map(desarializeCoupons)
      .filter(
        (coupon) =>
          coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
      );

    if (!coupons.length) {
      this.logger.debug({
        msg: 'Attempt to add order without coupons',
        id,
        customerId,
      });

      await this.voucherifyConnectorService.createOrder(
        order,
        items,
        orderMetadata,
      );

      return { status: true, actions: [] };
    }

    this.logger.debug({
      msg: 'Attempt to redeem vouchers',
      coupons,
      id,
      customerId,
    });
    const sentCoupons: SentCoupons[] = [];
    const usedCoupons: string[] = [];
    const notUsedCoupons: string[] = [];

    const sessionKey = order.custom?.fields.session;
    let response: RedemptionsRedeemStackableResponse;
    try {
      response = await this.voucherifyConnectorService.redeemStackableVouchers(
        coupons,
        sessionKey,
        order,
        items,
        orderMetadata,
      );
    } catch (e) {
      this.logger.debug({ msg: 'Redeem operation failed', error: e.details });
      return { status: true, actions: [] };
    }

    sentCoupons.push(
      ...response.redemptions.map((redeem) => {
        return {
          result: redeem.result,
          coupon: redeem.voucher?.code
            ? redeem.voucher.code
            : redeem['promotion_tier']['id'],
        };
      }),
    );

    this.logger.debug({
      msg: 'Voucherify redeem response',
      id,
      customerId,
      redemptions: response?.redemptions,
    });

    sentCoupons.forEach((sendedCoupon) => {
      if (sendedCoupon.result === 'SUCCESS') {
        usedCoupons.push(sendedCoupon.coupon);
      } else {
        notUsedCoupons.push(sendedCoupon.coupon);
      }
    });

    this.logger.debug({
      msg: 'Realized coupons',
      id,
      customerId,
      usedCoupons,
      notUsedCoupons,
    });
    const actions = [
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: notUsedCoupons,
      },
      {
        action: 'setCustomField',
        name: 'used_codes',
        value: usedCoupons,
      },
    ];

    return {
      status: true,
      actions: actions,
      redemptionsRedeemStackableResponse: response,
    };
  }
}
