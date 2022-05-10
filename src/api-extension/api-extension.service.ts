import { Injectable } from '@nestjs/common';
import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';

@Injectable()
export class ApiExtensionService {
  constructor(private readonly taxCategoriesService: TaxCategoriesService) {}

  async checkCart(body) {
    const cartObj = body?.resource?.obj;

    const lineItems = cartObj.lineItems;
    const currencyCode = cartObj.totalPrice?.currencyCode;
    const couponCodes = cartObj.custom.fields.discount_code;
    // const couponCodes = cartObj.custom.fields.discount_code;

    //checking codes
    const actions = [];

    //coupons off price <--need an upgrade ???  delete those witch not in list
    const couponsOff = [
      {
        name: 'coupon1',
        value: -10000,
      },
      {
        name: 'coupon2',
        value: -2000,
      },
    ];
    let couponsToAdd = [...couponsOff];
    const customLineItems = cartObj.customLineItems;
    for (const customLineItem of customLineItems) {
      couponsToAdd = couponsToAdd.filter(
        (coupon) => coupon.name !== customLineItem.slug,
      );
    }

    const taxCategoryResult =
      await this.taxCategoriesService.getCouponTaxCategory();

    if (!taxCategoryResult.found) {
      return { status: false, actions: [] };
    }

    for (const coupon of couponsToAdd) {
      actions.push({
        action: 'addCustomLineItem',
        name: {
          en: `Coupon ${-coupon.value / 100} ${currencyCode}`,
        },
        quantity: 1,
        money: {
          centAmount: coupon.value,
          currencyCode: currencyCode,
          type: 'centPrecision',
        },
        slug: coupon.name,
        taxCategory: {
          id: taxCategoryResult.taxCategory.id,
        },
      });
    }

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
