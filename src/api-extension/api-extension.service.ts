import { Injectable } from '@nestjs/common';
import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../commerceTools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';

@Injectable()
export class ApiExtensionService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
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

    const appliedCoupons =
      cartObj.customLineItems.map((coupon) => coupon.slug) ?? [];

    const newCouponCodes =
      cartObj.custom?.fields?.discount_code?.filter(
        (coupon) => !appliedCoupons.includes(coupon),
      ) ?? [];

    const couponsToDelete = appliedCoupons.filter(
      (coupon) => !cartObj.custom?.fields?.discount_code.includes(coupon),
    );

    for (const coupon of couponsToDelete) {
      actions.push({
        action: 'removeCustomLineItem',
        customLineItemId: cartObj.customLineItems.find(
          (customField) => customField.slug === coupon,
        ).id,
      });
    }

    const notValidCoupons = [];

    for (const coupon of appliedCoupons) {
      const voucherResult =
        await this.voucherifyConnectorService.validateVoucherWithCTCart(
          coupon,
          cartObj,
        );
      if (!voucherResult?.valid) {
        notValidCoupons.push(coupon);
        actions.push({
          action: 'removeCustomLineItem',
          customLineItemId: cartObj.customLineItems.find(
            (customField) => customField.slug === coupon,
          ).id,
        });
      }
    }

    let percentOff = 0;
    for (const coupon of newCouponCodes) {
      const voucherResult =
        await this.voucherifyConnectorService.validateVoucherWithCTCart(
          coupon,
          cartObj,
        );
      if (!voucherResult?.valid) {
        notValidCoupons.push(coupon);
      } else if (voucherResult?.discount?.type === 'PERCENT') {
        percentOff += voucherResult?.discount?.percent_off;
      } else if (voucherResult?.discount.type === 'AMOUNT') {
        actions.push({
          action: 'addCustomLineItem',
          name: {
            en: `Coupon ${-voucherResult?.discount?.amount_off / 100} ${
              voucherResult?.discount?.amount_off
            }`,
          },
          quantity: 1,
          money: {
            centAmount: voucherResult?.discount?.amount_off,
            currencyCode: currencyCode,
            type: 'centPrecision',
          },
          slug: coupon.name,
          taxCategory: {
            id: taxCategory.id,
          },
        });
      }
    }

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

    if (notValidCoupons.length) {
      actions.push({
        action: 'setCustomField',
        name: 'discount_codes',
        value: cartObj.custom?.fields?.discount_code?.filter(
          (coupon) => !notValidCoupons.includes(coupon) ?? [],
        ),
      });
    }

    return { status: true, actions: actions };
  }
}
