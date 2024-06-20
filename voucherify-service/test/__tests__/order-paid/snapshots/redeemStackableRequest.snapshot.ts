export const redeemStackableRequest = {
  session: { type: 'LOCK', key: 'ssn_WtM5V9yjHpmtHMOpYrlyqozHGRaO1zNy' },
  redeemables: [{ object: 'voucher', id: 'WXCQRBDKTP' }],
  order: {
    source_id: 'd805726e-5a6b-46b2-9d8d-f7aeb00c0f25',
    amount: 26500,
    status: 'PAID',
    items: [
      {
        source_id: 'M0E20000000DUIR',
        related_object: 'sku',
        quantity: 1,
        price: 26500,
        amount: 26500,
        product: { override: true, name: 'Pants Jacob Cohen green' },
        sku: { override: true, sku: 'Pants Jacob Cohen green', metadata: {} },
      },
    ],
    metadata: {
      card: undefined,
      location_id: undefined,
      payment_mean: undefined,
      booking_end_date: undefined,
      booking_start_date: undefined,
    },
  },
  customer: {
    source_id: '1ff6d7b2-a1a1-4f63-a63b-2d80ab5b0797',
    name: 'tyy tyy',
    email: '22@o2.pl',
    address: {
      city: 'ads',
      country: 'DE',
      postal_code: '123',
      line_1: 'adsasd',
    },
    phone: undefined,
  },
};
