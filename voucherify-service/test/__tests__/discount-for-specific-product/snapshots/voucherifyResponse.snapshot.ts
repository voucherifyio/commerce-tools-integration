export const voucherifyResponse = {
  valid: true,
  redeemables: [
    {
      order: {
        id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
        source_id: 'cart-id',
        created_at: '2022-07-07T11:26:37.521Z',
        amount: 20000,
        discount_amount: 0,
        total_discount_amount: 3000,
        initial_amount: 20000,
        applied_discount_amount: 0,
        total_applied_discount_amount: 3000,
        items: [
          {
            sku_id: 'skudiscounted-sneakers',
            product_id: 'discounted-sneakers',
            related_object: 'product',
            quantity: 1,
            price: 20000,
            amount: 20000,
            object: 'order_item',
            discount_amount: 3000,
            applied_discount_amount: 3000,
            subtotal_amount: 17000,
          },
        ],
        metadata: {},
        object: 'order',
        items_discount_amount: 3000,
        items_applied_discount_amount: 3000,
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
            id: 'skudiscounted-sneakers',
            source_id: 'discounted-sneakers',
            strict: true,
            effect: 'APPLY_TO_EVERY',
          },
        ],
        total: 2,
        object: 'list',
      },
      inapplicable_to: { data: [], total: 0, object: 'list' },
      metadata: {},
      id: 'SNEAKERS30',
      status: 'APPLICABLE',
      object: 'voucher',
      result: {
        discount: {
          type: 'AMOUNT',
          effect: 'APPLY_TO_ITEMS',
          amount_off: 3000,
        },
      },
    },
  ],
  order: {
    id: 'e66e763f-589a-4cb8-b478-7bac59f75814',
    source_id: 'cart-id',
    created_at: '2022-07-07T11:26:37.521Z',
    amount: 20000,
    discount_amount: 3000,
    total_discount_amount: 3000,
    initial_amount: 20000,
    applied_discount_amount: 0,
    total_applied_discount_amount: 0,
    items: [
      {
        sku_id: 'skudiscounted-sneakers',
        product_id: 'discounted-sneakers',
        related_object: 'product',
        quantity: 1,
        price: 20000,
        amount: 20000,
        object: 'order_item',
        discount_amount: 3000,
        applied_discount_amount: 3000,
        subtotal_amount: 17000,
      },
    ],
    metadata: {},
    object: 'order',
    items_discount_amount: 3000,
    items_applied_discount_amount: 3000,
  },
  tracking_id: 'track_zTa+v4d+mc0ixHNURqEvtCLxvdT5orvdtWeqzafQxfA5XDblMYxS/w==',
  session: {
    key: 'existing-session-id',
    type: 'LOCK',
    ttl: 7,
    ttl_unit: 'DAYS',
  },
  stacking_rules: {
    redeemables_limit: 30,
    applicable_redeemables_limit: 3,
    applicable_exclusive_redeemables_limit: 1,
    applicable_redeemables_per_category_limit: 3,
    exclusive_categories: ['cat_0e39d9b0e551edcc40'],
    joint_categories: [],
    redeemables_application_mode: 'PARTIAL',
    redeemables_sorting_rule: 'CATEGORY_HIERARCHY',
  },
};
