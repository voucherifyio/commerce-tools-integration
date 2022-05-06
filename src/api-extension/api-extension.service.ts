import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiExtensionService {
  checkCart(body) {
    const cartObj = body?.resource?.obj;

    const lineItems = cartObj.lineItems;
    const currencyCode = cartObj.totalPrice?.currencyCode;
    const couponCodes = cartObj.custom.fields.discount_code;
    const actions = [];

    console.log(couponCodes);

    let percentOff = 0;
    //checking codes
    percentOff += 10; // if(-X% all products)  percentOff+=X

    for (const lineItem of lineItems) {
      if (
        lineItem.variant.prices.find(
          (price) => price.value.currencyCode === currencyCode,
        ).value.centAmount > 0
      )
        //if price of item is bigger than 0
        //meaning - other coupons, gift cards should not be lowered by this operation.
        actions.push({
          action: 'setLineItemPrice',
          lineItemId: lineItem.id,
          externalPrice: {
            currencyCode: currencyCode,
            centAmount:
              lineItem.variant.prices.find(
                (price) => price.value.currencyCode === currencyCode,
              ).value.centAmount *
              ((100 - percentOff) / 10),
          },
        });
    }

    return { status: true, actions: actions };
  }
}
