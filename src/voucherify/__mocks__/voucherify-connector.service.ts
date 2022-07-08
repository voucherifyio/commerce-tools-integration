import {
  OrdersItem,
  StackableRedeemableResponse,
  ValidationSessionResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { VoucherifyConnectorService } from '../voucherify-connector.service';

interface MockedVoucherifyConnectorService extends VoucherifyConnectorService {
  __simulateDefaultValidateStackable: () => void;
}

const defaultValidateVouchersResponse = {
  valid: true,
  redeemables: [
    {
      status: 'APPLICABLE',
      id: 'HELLO_WORLD!',
      object: 'voucher',
      order: {
        source_id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
        amount: 29200,
        discount_amount: 2500,
        total_discount_amount: 2500,
        total_amount: 26700,
        applied_discount_amount: 2500,
        total_applied_discount_amount: 2500,
        items: [
          {
            object: 'order_item',
            source_id: 'M0E20000000E1AZ',
            related_object: 'sku',
            product_id: 'prod_0b5672a19f4147f017',
            quantity: 1,
            amount: 12000,
            price: 12000,
            subtotal_amount: 12000,
            product: {
              id: 'prod_0b5672a19f4147f017',
              source_id: '9050a5d2-8f14-4e01-bcdc-c100dd1b441f',
              name: 'Sneakers New Balance multi',
              override: true,
            },
            sku: {
              id: 'sku_0b56734248814789a5',
              source_id: 'M0E20000000E1AZ',
              sku: 'Sneakers New Balance multi',
              price: 12000,
              override: true,
            },
          } as OrdersItem,
        ],
        metadata: {},
        customer_id: null,
        referrer_id: null,
        object: 'order',
      } as unknown,
      applicable_to: {
        data: [],
        total: 0,
        data_ref: 'data',
        object: 'list',
      },
      inapplicable_to: {
        data: [],
        total: 0,
        data_ref: 'data',
        object: 'list',
      },
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ORDER',
          amount_off: 2500,
        },
      },
    } as StackableRedeemableResponse,
  ],
  order: {
    source_id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    amount: 29200,
    discount_amount: 3500,
    total_discount_amount: 3500,
    total_amount: 25700,
    applied_discount_amount: 3500,
    total_applied_discount_amount: 3500,
    items: [
      {
        object: 'order_item',
        source_id: 'M0E20000000E1AZ',
        related_object: 'sku',
        product_id: 'prod_0b5672a19f4147f017',
        quantity: 1,
        amount: 12000,
        price: 12000,
        subtotal_amount: 12000,
        product: {
          id: 'prod_0b5672a19f4147f017',
          source_id: '9050a5d2-8f14-4e01-bcdc-c100dd1b441f',
          name: 'Sneakers New Balance multi',
          override: true,
        },
        sku: {
          id: 'sku_0b56734248814789a5',
          source_id: 'M0E20000000E1AZ',
          sku: 'Sneakers New Balance multi',
          price: 12000,
          override: true,
        },
      },
      {
        object: 'order_item',
        source_id: 'M0E20000000E2Q5',
        related_object: 'sku',
        product_id: 'prod_0b5672b0c2c147ff86',
        quantity: 1,
        amount: 8600,
        price: 8600,
        subtotal_amount: 8600,
        product: {
          id: 'prod_0b5672b0c2c147ff86',
          source_id: '202882a6-6f3d-477d-897c-e0abd97935a5',
          name: 'Polo Ralph Lauren green',
          override: true,
        },
        sku: {
          id: 'sku_0b5673d02f01479ad0',
          source_id: 'M0E20000000E2Q5',
          sku: 'Polo Ralph Lauren green',
          price: 8600,
          override: true,
        },
      },
      {
        object: 'order_item',
        source_id: 'M0E20000000E2Q8',
        related_object: 'sku',
        product_id: 'prod_0b5672b0c2c147ff86',
        quantity: 1,
        amount: 8600,
        price: 8600,
        subtotal_amount: 8600,
        product: {
          id: 'prod_0b5672b0c2c147ff86',
          source_id: '202882a6-6f3d-477d-897c-e0abd97935a5',
          name: 'Polo Ralph Lauren green',
          override: true,
        },
        sku: {
          id: 'sku_0b5673d04941479adb',
          source_id: 'M0E20000000E2Q8',
          sku: 'Polo Ralph Lauren green',
          price: 8600,
          override: true,
        },
      },
    ],
    metadata: {},
    customer_id: null,
    referrer_id: null,
    object: 'order',
  } as unknown,
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: {
    key: 'ssn_HFTS1dgkRTrJikmCfKAUbDEmGrXpScuw',
    type: 'LOCK',
    ttl: 7,
    ttl_unit: 'DAYS',
  } as ValidationSessionResponse,
} as ValidationValidateStackableResponse;

const voucherifyConnectorService = jest.createMockFromModule(
  '../voucherify-connector.service',
) as MockedVoucherifyConnectorService;

voucherifyConnectorService.__simulateDefaultValidateStackable = () => {
  voucherifyConnectorService.validateStackableVouchersWithCTCart = jest.fn(() =>
    Promise.resolve(defaultValidateVouchersResponse),
  );
};

voucherifyConnectorService.__simulateDefaultValidateStackable();

export { voucherifyConnectorService as VoucherifyConnectorService };
