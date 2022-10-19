export const voucherifyResponse = {
  valid: true,
  redeemables: [
    {
      order: {
        id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
        source_id: 'cart-id',
        created_at: '2022-07-07T11:26:37.521Z',
        amount: 26500,
        discount_amount: 2000,
        total_discount_amount: 2000,
        initial_amount: 26500,
        applied_discount_amount: 2000,
        total_applied_discount_amount: 2000,
        items: [
          {
            sku_id: 'product-sku1',
            product_id: 'product-id',
            related_object: 'product',
            quantity: 1,
            price: 26500,
            amount: 26500,
            object: 'order_item',
          },
        ],
        metadata: {},
        object: 'order',
        items_discount_amount: 0,
        items_applied_discount_amount: 0,
      },
      applicable_to: { data: [], total: 0, object: 'list' },
      inapplicable_to: { data: [], total: 0, object: 'list' },
      metadata: {},
      id: 'AMOUNT20',
      status: 'APPLICABLE',
      object: 'voucher',
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ORDER',
          amount_off: 2000,
        },
      },
    },
  ],
  order: {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'cart-id',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 26500,
    discount_amount: 2000,
    total_discount_amount: 2000,
    initial_amount: 26500,
    applied_discount_amount: 2000,
    total_applied_discount_amount: 2000,
    items: [
      {
        sku_id: 'product-sku1',
        product_id: 'product-id',
        related_object: 'product',
        quantity: 1,
        price: 26500,
        amount: 26500,
        object: 'order_item',
      },
    ],
    metadata: {},
    object: 'order',
    items_discount_amount: 0,
    items_applied_discount_amount: 0,
  },
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: { key: 'new-session-id', type: 'LOCK', ttl: 7, ttl_unit: 'DAYS' },
};
