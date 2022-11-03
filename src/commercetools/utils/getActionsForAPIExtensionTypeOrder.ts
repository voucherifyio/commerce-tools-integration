import { PaymentState } from '@commercetools/platform-sdk';

export const getActionsForAPIExtensionTypeOrder = (
  paymentState: PaymentState,
) => {
  return paymentState
    ? [
        {
          action: 'changePaymentState',
          paymentState: paymentState === 'Paid' ? 'Failed' : 'Paid',
        },
        {
          action: 'changePaymentState',
          paymentState: paymentState === 'Paid' ? 'Paid' : paymentState,
        },
      ]
    : [];
};
