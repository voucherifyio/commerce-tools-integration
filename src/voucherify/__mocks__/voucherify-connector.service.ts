import { Cart } from '@commercetools/platform-sdk';
import {
  DiscountVouchersEffectTypes,
  OrdersCreateResponse,
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  ValidationSessionResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { VoucherifyConnectorService } from '../voucherify-connector.service';

type StackableValidationResponseModifier = (
  response: ValidationValidateStackableResponse,
) => ValidationValidateStackableResponse;

export const getVoucherifyConnectorServiceMockWithDefinedResponse = (
  modifiers: StackableValidationResponseModifier[] = [],
) => {
  const voucherifyConnectorService = jest.createMockFromModule(
    '../voucherify-connector.service',
  ) as VoucherifyConnectorService;

  voucherifyConnectorService.getAvailablePromotions = jest
    .fn()
    .mockResolvedValue([]);

  const validationResponse = modifiers.reduce((response, modifier) => {
    return modifier(response);
  }, defaultValidateVouchersResponse());

  voucherifyConnectorService.validateStackableVouchersWithCTCart = jest
    .fn()
    .mockResolvedValue(validationResponse);

  return voucherifyConnectorService;
};

const resetOrderAmounts = (
  response: ValidationValidateStackableResponse,
): ValidationValidateStackableResponse => {
  return {
    ...response,
    order: {
      ...response.order,
      discount_amount: 0,
      items_discount_amount: 0,
      total_discount_amount: 0,
      applied_discount_amount: 0,
      items_applied_discount_amount: 0,
      total_applied_discount_amount: 0,
    },
  };
};

export const useCartAsOrderReferenceModifier =
  (cart: Cart) =>
  (
    response: ValidationValidateStackableResponse,
  ): ValidationValidateStackableResponse => {
    return resetOrderAmounts({
      ...response,
      redeemables: [],
      order: {
        ...response.order,
        source_id: cart.id,
        amount: cart.totalPrice.centAmount,
        initial_amount: cart.totalPrice.centAmount,
        items: cart.lineItems.map(
          (lineItem) =>
            ({
              sku_id: lineItem.variant.sku,
              product_id: lineItem.productId,
              related_object: 'product',
              quantity: lineItem.quantity,
              price: lineItem.price.value.centAmount,
              amount: lineItem.price.value.centAmount,
              object: 'order_item',
            } as OrdersItem),
        ),
      },
    });
  };

export const addDiscountCoupon =
  (
    couponCode: string,
    amount: number,
    status: StackableRedeemableResponseStatus = 'APPLICABLE',
  ) =>
  (
    response: ValidationValidateStackableResponse,
  ): ValidationValidateStackableResponse => {
    const responseWithRedeemables = useRedeemable(
      {
        id: couponCode,
        status,
        object: 'voucher',
        result: {
          discount: {
            type: 'AMOUNT',
            effect: 'APPLY_TO_ORDER',
            amount_off: amount,
          },
        },
      },
      amount,
    )(response);

    const { order } = responseWithRedeemables;

    return {
      ...responseWithRedeemables,
      order: {
        ...responseWithRedeemables.order,
        discount_amount: order.discount_amount + amount,
        total_discount_amount: order.total_discount_amount + amount,
        applied_discount_amount: order.applied_discount_amount + amount,
        total_applied_discount_amount:
          order.total_applied_discount_amount + amount,
      },
    };
  };

const useRedeemable =
  (
    redeemable: StackableRedeemableResponse,
    redeemedAmount: number,
    applyToItems = false,
  ) =>
  (
    response: ValidationValidateStackableResponse,
  ): ValidationValidateStackableResponse => {
    const { order } = response;
    const discountRedeemedAlready = response.redeemables.reduce(
      (total, redeemable) => total + redeemable.order.applied_discount_amount,
      0,
    );
    const itemsRedeemedAlready = response.redeemables.reduce(
      (total, redeemable) =>
        total + redeemable.order.items_applied_discount_amount,
      0,
    );

    return {
      ...response,
      redeemables: [
        ...response.redeemables,
        {
          order: {
            ...order,
            discount_amount:
              discountRedeemedAlready + (!applyToItems ? redeemedAmount : 0),
            items_discount_amount:
              itemsRedeemedAlready + (applyToItems ? redeemedAmount : 0),
            total_discount_amount: discountRedeemedAlready + redeemedAmount,
            // total_amount: order.amount - redeemedAlready - redeemedAmount,
            items_applied_discount_amount:
              itemsRedeemedAlready + (applyToItems ? redeemedAmount : 0),
            total_applied_discount_amount:
              discountRedeemedAlready + itemsRedeemedAlready + redeemedAmount,
            applied_discount_amount: !applyToItems ? redeemedAmount : 0,
          },
          applicable_to: {
            data: [],
            total: 0,
            object: 'list',
          },
          inapplicable_to: {
            data: [],
            total: 0,
            object: 'list',
          },
          metadata: {},
          ...redeemable,
        },
      ],
    };
  };

export const useSessionKey =
  (sessionKey) =>
  (
    response: ValidationValidateStackableResponse,
  ): ValidationValidateStackableResponse => ({
    ...response,
    session: { ...response.session, key: sessionKey },
  });

interface MockedVoucherifyConnectorService extends VoucherifyConnectorService {
  __simulateDefaultValidateStackable: () => MockedVoucherifyConnectorService;
  __useCartAsOrderReference: (cart: Cart) => MockedVoucherifyConnectorService;
  __emptyRedeemables: () => MockedVoucherifyConnectorService;
  __useRedeemable: (
    redeemable: StackableRedeemableResponse,
    redeemedAmount: number,
    applyToItems?: boolean,
  ) => MockedVoucherifyConnectorService;
  __addDiscountCoupon: (
    couponCode: string,
    amount: number,
    status?: StackableRedeemableResponseStatus,
  ) => MockedVoucherifyConnectorService;
  __addPercentageRateCoupon: (
    couponCode: string,
    percentage: number,
    status?: StackableRedeemableResponseStatus,
  ) => MockedVoucherifyConnectorService;
  __addProductDiscount: (
    couponCode: string,
    productId: string,
    amount: number,
    status?: StackableRedeemableResponseStatus,
  ) => MockedVoucherifyConnectorService;
  __addGiftProductToCartDiscount: (
    couponCode: string,
    skuId: string,
    productId: string,
    productPrice: number,
    effect?: DiscountVouchersEffectTypes,
    status?: StackableRedeemableResponseStatus,
  ) => MockedVoucherifyConnectorService;
  __useSessionKey: (sessionKey: string) => MockedVoucherifyConnectorService;
  __simulateInvalidValidation: () => MockedVoucherifyConnectorService;
  __withInapplicableCoupon: (
    couponCode: string,
  ) => MockedVoucherifyConnectorService;
  __withInexistentCoupon: (
    couponCode: string,
  ) => MockedVoucherifyConnectorService;
  __currentValidateVouchersResponse: ValidationValidateStackableResponse;
}

function defaultValidateVouchersResponse(): ValidationValidateStackableResponse {
  const order: OrdersCreateResponse = {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 29200,
    discount_amount: 2500,
    total_discount_amount: 2500,
    initial_amount: 29200,
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
    object: 'order',
  };

  return {
    valid: true,
    redeemables: [
      {
        status: 'APPLICABLE',
        id: 'HELLO_WORLD!',
        object: 'voucher',
        order,
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
    order: order,
    tracking_id:
      'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
    session: {
      key: 'ssn_HFTS1dgkRTrJikmCfKAUbDEmGrXpScuw',
      type: 'LOCK',
      ttl: 7,
      ttl_unit: 'DAYS',
    } as ValidationSessionResponse,
  };
}

const voucherifyConnectorService = jest.createMockFromModule(
  '../voucherify-connector.service',
) as MockedVoucherifyConnectorService;

voucherifyConnectorService.__simulateDefaultValidateStackable = () => {
  voucherifyConnectorService.__currentValidateVouchersResponse =
    defaultValidateVouchersResponse();

  voucherifyConnectorService.getAvailablePromotions = jest.fn(() =>
    Promise.resolve([]),
  );
  voucherifyConnectorService.validateStackableVouchersWithCTCart = jest.fn(() =>
    Promise.resolve(
      voucherifyConnectorService.__currentValidateVouchersResponse,
    ),
  );

  return voucherifyConnectorService;
};

// voucherifyConnectorService.__useCartAsOrderReference = (cart: Cart) => {
//   voucherifyConnectorService.__currentValidateVouchersResponse = {
//     ...voucherifyConnectorService.__currentValidateVouchersResponse,
//     order: {
//       ...voucherifyConnectorService.__currentValidateVouchersResponse.order,
//       source_id: cart.id,
//       amount: cart.totalPrice.centAmount,
//       initial_amount: cart.totalPrice.centAmount,
//       items: cart.lineItems.map(
//         (lineItem) =>
//           ({
//             sku_id: lineItem.variant.sku,
//             product_id: lineItem.productId,
//             related_object: 'product',
//             quantity: lineItem.quantity,
//             price: lineItem.price.value.centAmount,
//             amount: lineItem.price.value.centAmount,
//             object: 'order_item',
//           } as OrdersItem),
//       ),
//     },
//     redeemables: [],
//   };
//   resetOrderAmounts();

//   return voucherifyConnectorService;
// };

// voucherifyConnectorService.__emptyRedeemables = () => {
//   voucherifyConnectorService.__currentValidateVouchersResponse.redeemables = [];
//   resetOrderAmounts();
//   return voucherifyConnectorService;
// };

voucherifyConnectorService.__useRedeemable = (
  redeemable: StackableRedeemableResponse,
  redeemedAmount: number,
  applyToItems = false,
) => {
  const { order } =
    voucherifyConnectorService.__currentValidateVouchersResponse;
  const discountRedeemedAlready =
    voucherifyConnectorService.__currentValidateVouchersResponse.redeemables.reduce(
      (total, redeemable) => total + redeemable.order.applied_discount_amount,
      0,
    );
  const itemsRedeemedAlready =
    voucherifyConnectorService.__currentValidateVouchersResponse.redeemables.reduce(
      (total, redeemable) =>
        total + redeemable.order.items_applied_discount_amount,
      0,
    );

  voucherifyConnectorService.__currentValidateVouchersResponse.redeemables.push(
    {
      order: {
        ...order,
        discount_amount:
          discountRedeemedAlready + (!applyToItems ? redeemedAmount : 0),
        items_discount_amount:
          itemsRedeemedAlready + (applyToItems ? redeemedAmount : 0),
        total_discount_amount: discountRedeemedAlready + redeemedAmount,
        // total_amount: order.amount - redeemedAlready - redeemedAmount,
        items_applied_discount_amount:
          itemsRedeemedAlready + (applyToItems ? redeemedAmount : 0),
        total_applied_discount_amount:
          discountRedeemedAlready + itemsRedeemedAlready + redeemedAmount,
        applied_discount_amount: !applyToItems ? redeemedAmount : 0,
      },
      applicable_to: {
        data: [],
        total: 0,
        object: 'list',
      },
      inapplicable_to: {
        data: [],
        total: 0,
        object: 'list',
      },
      metadata: {},
      ...redeemable,
    },
  );
  return voucherifyConnectorService;
};

voucherifyConnectorService.__addDiscountCoupon = (
  couponCode: string,
  amount: number,
  status = 'APPLICABLE',
) => {
  voucherifyConnectorService.__useRedeemable(
    {
      id: couponCode,
      status,
      object: 'voucher',
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ORDER',
          amount_off: amount,
        },
      },
    },
    amount,
  );

  const { order } =
    voucherifyConnectorService.__currentValidateVouchersResponse;

  Object.assign(
    voucherifyConnectorService.__currentValidateVouchersResponse.order,
    {
      discount_amount: order.discount_amount + amount,
      total_discount_amount: order.total_discount_amount + amount,
      applied_discount_amount: order.applied_discount_amount + amount,
      total_applied_discount_amount:
        order.total_applied_discount_amount + amount,
    },
  );
  return voucherifyConnectorService;
};

voucherifyConnectorService.__addPercentageRateCoupon = (
  couponCode: string,
  percentage: number,
  status = 'APPLICABLE',
) => {
  const { order } =
    voucherifyConnectorService.__currentValidateVouchersResponse;
  const discount = Math.round((order.amount * percentage) / 100);

  voucherifyConnectorService.__useRedeemable(
    {
      id: couponCode,
      status,
      object: 'voucher',
      result: {
        discount: {
          type: 'PERCENT',
          effect: 'APPLY_TO_ORDER',
          percent_off: percentage,
        },
      },
    },
    discount,
  );

  Object.assign(
    voucherifyConnectorService.__currentValidateVouchersResponse.order,
    {
      discount_amount: order.discount_amount + discount,
      total_discount_amount: order.total_discount_amount + discount,
      applied_discount_amount: order.applied_discount_amount + discount,
      total_applied_discount_amount:
        order.total_applied_discount_amount + discount,
    },
  );
  return voucherifyConnectorService;
};

voucherifyConnectorService.__addProductDiscount = (
  couponCode: string,
  productId: string,
  amount: number,
  status = 'APPLICABLE',
) => {
  voucherifyConnectorService.__useRedeemable(
    {
      id: couponCode,
      status,
      object: 'voucher',
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ITEMS',
          amount_off: amount,
        },
      },
      applicable_to: {
        data: [
          {
            object: 'products_collection',
            id: 'pc_id',
            effect: 'APPLY_TO_EVERY',
            strict: false,
          },
          {
            object: 'sku',
            id: `sku${productId}`,
            source_id: productId,
            strict: true,
            effect: 'APPLY_TO_EVERY',
          },
        ],
        total: 2,
        object: 'list',
      },
    },
    amount,
    true,
  );
  const item =
    voucherifyConnectorService.__currentValidateVouchersResponse.order.items.find(
      (i) => i.product_id === productId,
    );
  if (item) {
    Object.assign(item, {
      discount_amount: amount,
      applied_discount_amount: amount,
      subtotal_amount: item.amount - amount,
    });
  }
  const { order } =
    voucherifyConnectorService.__currentValidateVouchersResponse;

  Object.assign(
    voucherifyConnectorService.__currentValidateVouchersResponse.order,
    {
      discount_amount: order.discount_amount + amount,
      total_discount_amount: order.total_discount_amount + amount,
      items_discount_amount: order.items_discount_amount + amount,
      items_applied_discount_amount:
        order.items_applied_discount_amount + amount,
    },
  );

  return voucherifyConnectorService;
};

voucherifyConnectorService.__addGiftProductToCartDiscount = (
  couponCode,
  skuId,
  productId,
  productPrice,
  effect = 'ADD_NEW_ITEMS',
  status = 'APPLICABLE',
) => {
  voucherifyConnectorService.__useRedeemable(
    {
      id: couponCode,
      status,
      object: 'voucher',
      result: {
        discount: {
          type: 'UNIT',
          effect,
          unit_off: 1,
          unit_type: productId,
          sku: {
            id: 'sku-id',
            source_id: skuId,
          },
          product: {
            id: 'product-id',
            source_id: productId,
          },
        },
      },
    },
    productPrice,
    true,
  );
  const { order } =
    voucherifyConnectorService.__currentValidateVouchersResponse;

  Object.assign(
    voucherifyConnectorService.__currentValidateVouchersResponse.order,
    {
      initial_amount: order.amount,
      amount: order.amount + productPrice,
      items_discount_amount: order.items_discount_amount + productPrice,
      total_discount_amount: order.total_discount_amount + productPrice,
      items_applied_discount_amount:
        order.items_applied_discount_amount + productPrice,
      total_applied_discount_amount:
        order.total_applied_discount_amount + productPrice,
    },
  );
  const { redeemables } =
    voucherifyConnectorService.__currentValidateVouchersResponse;
  const lastRedeemable = redeemables[redeemables.length - 1];
  lastRedeemable.order.items = lastRedeemable.order.items || [];
  lastRedeemable.order.items.push({
    source_id: skuId,
    related_object: 'sku',
    product_id: productId,
    quantity: 1,
    discount_quantity: 1,
    initial_quantity: 1,
    amount: productPrice,
    discount_amount: productPrice,
    initial_amount: productPrice,
    applied_discount_amount: productPrice,
    price: productPrice,
    subtotal_amount: 0,
    product: {
      id: 'product-id',
      source_id: productId,
      override: true,
    },
    sku: {
      id: 'sku-id',
      source_id: skuId,
      price: productPrice,
      override: true,
    },
  } as any);

  return voucherifyConnectorService;
};

voucherifyConnectorService.__useSessionKey = (sessionKey) => {
  voucherifyConnectorService.__currentValidateVouchersResponse.session.key =
    sessionKey;
  return voucherifyConnectorService;
};

voucherifyConnectorService.__simulateInvalidValidation = () => {
  voucherifyConnectorService.__currentValidateVouchersResponse = {
    valid: false,
    redeemables: [],
  };
  return voucherifyConnectorService;
};

voucherifyConnectorService.__withInapplicableCoupon = (couponCode: string) => {
  voucherifyConnectorService.__currentValidateVouchersResponse.redeemables.push(
    {
      status: 'INAPPLICABLE',
      id: couponCode,
      object: 'voucher',
      result: {
        error: {
          code: 400,
          key: 'quantity_exceeded',
          message: 'quantity exceeded',
          details: couponCode,
          request_id: 'v-123123123123',
        },
      },
    },
  );
  return voucherifyConnectorService;
};

voucherifyConnectorService.__withInexistentCoupon = (couponCode: string) => {
  voucherifyConnectorService.__currentValidateVouchersResponse.redeemables.push(
    {
      status: 'INAPPLICABLE',
      id: couponCode,
      object: 'voucher',
      result: {
        error: {
          code: 404,
          key: 'not_found',
          message: 'Resource not found',
          details: `Cannot find voucher with id ${couponCode}`,
          request_id: 'v-123123123123',
        },
      },
    },
  );
  return voucherifyConnectorService;
};

voucherifyConnectorService.__simulateDefaultValidateStackable();

export {
  voucherifyConnectorService as VoucherifyConnectorService,
  MockedVoucherifyConnectorService,
};
