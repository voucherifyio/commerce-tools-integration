import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiExtensionService {
  checkCart(body) {
    const cartObj = body?.resource?.obj;

    const lineItems = cartObj.lineItems;
    const currencyCode = cartObj.totalPrice?.currencyCode;
    const couponCodes = cartObj.custom.fields.discount_code;

    //checking codes
    const actions = [];

    const X = 50;
    //if(-X% all products)
    for (const lineItem of lineItems) {
      actions.push({
        action: 'setLineItemPrice',
        lineItemId: lineItem.id,
        externalPrice: {
          currencyCode: currencyCode,
          centAmount:
            lineItem.variant.prices.find(
              (price) => price.value.currencyCode === currencyCode,
            ).value.centAmount *
            ((100 - X) / 10),
        },
      });
    }

    return { status: true, actions: actions };
  }
}
