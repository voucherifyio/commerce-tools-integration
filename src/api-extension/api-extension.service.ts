import { HttpException, Injectable } from '@nestjs/common';
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

    let percentOff = 0;

    let couponsValidation;
    const coupons = cartObj.custom?.fields?.discount_codes ?? [];
    if (coupons.length) {
      couponsValidation =
        await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
          coupons,
          cartObj,
        );
      if (
        couponsValidation.redeemables.filter(
          (voucher) => voucher.status !== 'APPLICABLE',
        ).length
      ) {
        throw new HttpException(
          {
            errors: couponsValidation.redeemables
              .filter((voucher) => voucher.status !== 'APPLICABLE')
              .map((coupon) => {
                return {
                  code: `InvalidInput`,
                  message: `Coupon '${coupon?.id}' is ${coupon.status}`,
                  extensionExtraInfo: {
                    coupon: coupon?.id,
                    status: coupon.status,
                  },
                };
              }),
          },
          400,
        );
      }
    }

    const appliedCoupons =
      cartObj.customLineItems?.map((coupon) => coupon.slug) ?? [];

    let taxCategory;

    if (couponsValidation && couponsValidation?.valid) {
      for (const redeemable of couponsValidation.redeemables) {
        if (redeemable.result.discount.type === 'PERCENT') {
          percentOff += redeemable.result.discount.percent_off;
        }
        if (
          redeemable.result.discount.type === 'AMOUNT' &&
          !appliedCoupons.includes(redeemable.id)
        ) {
          if (!taxCategory) {
            taxCategory =
              await this.taxCategoriesService.getCouponTaxCategory();
            if (!taxCategory) {
              throw new HttpException(
                {
                  errors: [
                    {
                      code: `General`,
                      message: `Coupon tax category was not configured correctly`,
                      extensionExtraInfo: {
                        taxCategoryName: 'coupon',
                        status: 'not found',
                      },
                    },
                  ],
                },
                400,
              );
            }
          }
          if (
            cartObj?.country &&
            !taxCategory?.rates?.find(
              (rate) => rate.country === cartObj.country,
            )
          ) {
            await this.taxCategoriesService.addCountryToCouponTaxCategory(
              taxCategory,
              cartObj.country,
            );
          }
          actions.push({
            action: 'addCustomLineItem',
            name: {
              en: `Coupon ${
                -redeemable.result.discount.amount_off / 100
              } ${currencyCode}`,
            },
            quantity: 1,
            money: {
              centAmount: -redeemable.result.discount.amount_off,
              currencyCode: currencyCode,
              type: 'centPrecision',
            },
            slug: redeemable.id,
            taxCategory: {
              id: taxCategory.id,
            },
          });
        }
      }
    }

    const couponsToDelete = appliedCoupons.filter(
      (coupon) => !cartObj.custom?.fields?.discount_codes?.includes(coupon),
    );

    for (const coupon of couponsToDelete) {
      actions.push({
        action: 'removeCustomLineItem',
        customLineItemId: cartObj.customLineItems.find(
          (customField) => customField.slug === coupon,
        ).id,
      });
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
            centAmount: Math.round(
              lineItem.variant.prices.find(
                (price) => price.value.currencyCode === currencyCode,
              ).value.centAmount *
                ((100 - percentOff) / 100),
            ),
          },
        });
    }

    return { status: true, actions: actions };
  }
}
