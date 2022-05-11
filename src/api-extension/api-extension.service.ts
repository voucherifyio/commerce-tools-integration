import { Injectable } from '@nestjs/common';
import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../commerceTools/types/types.service';

@Injectable()
export class ApiExtensionService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
  ) {}

  async checkCartAndMutate(
    body,
  ): Promise<{ status: boolean; actions: object[] }> {
    const cartObj = body?.resource?.obj;
    const version = cartObj.version;
    const actions = [];
    const couponType = await this.typesService.findCouponType();
    if (!couponType) {
      throw new Error('CouponType not found');
    }
    if (version === 1) {
      return {
        status: true,
        actions: [
          {
            action: 'setCustomType',
            type: {
              id: couponType.id,
            },
            name: 'couponCodes',
          },
        ],
      };
    }

    const lineItems = cartObj.lineItems;
    const currencyCode = cartObj.totalPrice?.currencyCode;

    const taxCategory = await this.taxCategoriesService.getCouponTaxCategory();

    if (!taxCategory) {
      return { status: false, actions: [] };
    }

    const couponCodes = cartObj.custom?.fields?.discount_code ?? [];

    //checking codes

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

    const couponsToAdd = [...couponsOff].filter((coupon) =>
      cartObj.customLineItems.some((lineItem) => lineItem.slug === coupon.name),
    );

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
          id: taxCategory.id,
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
