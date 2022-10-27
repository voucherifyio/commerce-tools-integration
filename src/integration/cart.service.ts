import { Cart, Product } from '@commercetools/platform-sdk';
import { Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  StackableRedeemableResultDiscountUnit,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { uniqBy } from 'lodash';

import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { TypesService } from '../commercetools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import getCartActionBuilders from '../commercetools/cartActions/getCartActionBuilders';
import { desarializeCoupons, Coupon, CouponStatus } from './coupon';
import {
  CartResponse,
  PriceSelector,
  ProductToAdd,
  ValidateCouponsResult,
  CartDiscountApplyMode,
} from './types';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { ProductMapper } from './mappers/product';
import { ConfigService } from '@nestjs/config';
import sleep from './utils/sleep';
import { CommercetoolsService } from '../commercetools/commercetools.service';

function getCouponsFromCart(cart: Cart): Coupon[] {
  return (cart.custom?.fields?.discount_codes ?? [])
    .map(desarializeCoupons)
    .filter(
      (coupon) =>
        coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
    ); // we already declined them, will be removed by frontend
}

function checkCouponsValidatedAsState(
  coupons: Coupon[],
  validatedCoupons: StackableRedeemableResponse[],
  status: CouponStatus,
): boolean {
  return (
    validatedCoupons.length === 0 ||
    coupons
      .filter((coupon) => coupon.status === status)
      .every((coupon) =>
        validatedCoupons.find((element) => element.id === coupon.code),
      )
  );
}

function checkIfAllInapplicableCouponsArePromotionTier(
  notApplicableCoupons: StackableRedeemableResponse[],
) {
  const inapplicableCouponsPromitonTier = notApplicableCoupons.filter(
    (notApplicableCoupon) => notApplicableCoupon.object === 'promotion_tier',
  );

  return notApplicableCoupons.length === inapplicableCouponsPromitonTier.length;
}

function checkIfOnlyNewCouponsFailed(
  coupons: Coupon[],
  applicableCoupons: StackableRedeemableResponse[],
  notApplicableCoupons: StackableRedeemableResponse[],
  skippedCoupons: StackableRedeemableResponse[],
): boolean {
  const areAllNewCouponsNotApplicable = checkCouponsValidatedAsState(
    coupons,
    notApplicableCoupons,
    'NEW',
  );

  const areAllAppliedCouponsApplicable = checkCouponsValidatedAsState(
    coupons,
    applicableCoupons,
    'APPLIED',
  );

  const areAllAppliedCouponsSkipped = checkCouponsValidatedAsState(
    coupons,
    skippedCoupons,
    'APPLIED',
  );

  return (
    notApplicableCoupons.length !== 0 &&
    areAllNewCouponsNotApplicable &&
    areAllAppliedCouponsSkipped &&
    areAllAppliedCouponsApplicable
  );
}

function calculateTotalDiscountAmount(
  validatedCoupons: ValidationValidateStackableResponse,
) {
  let totalDiscountAmount = 0;
  if (
    validatedCoupons.redeemables.find(
      (redeemable) => redeemable?.order?.items?.length,
    )
  ) {
    //Voucherify "order.total_applied_discount_amount" is not always calculated correctly,
    //so we need to iterate through the items to calculated discounted amount
    validatedCoupons.redeemables.forEach((redeemable) => {
      redeemable.order.items.forEach((item) => {
        if ((item as any).total_applied_discount_amount) {
          totalDiscountAmount += (item as any).total_applied_discount_amount;
        } else if ((item as any).total_discount_amount) {
          totalDiscountAmount += (item as any).total_discount_amount;
        }
      });
    });
  }

  if (totalDiscountAmount === 0) {
    return (
      validatedCoupons.order?.total_applied_discount_amount ??
      validatedCoupons.order?.total_discount_amount ??
      0
    );
  }

  if (totalDiscountAmount > (validatedCoupons?.order?.amount ?? 0)) {
    return validatedCoupons.order.amount;
  }
  return totalDiscountAmount;
}

@Injectable()
export class CartService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
    private readonly logger: Logger,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly productMapper: ProductMapper,
    private readonly configService: ConfigService,
    private readonly commercetoolsService: CommercetoolsService,
  ) {}

  public async validateCoupons(
    cart: Cart,
    sessionKey?: string | null,
  ): Promise<ValidateCouponsResult> {
    const { id, customerId, anonymousId } = cart;
    const coupons: Coupon[] = getCouponsFromCart(cart);
    let uniqCoupons: Coupon[] = uniqBy(coupons, 'code');
    if (coupons.length !== uniqCoupons.length) {
      this.logger.debug({
        msg: 'Duplicates found and deleted',
      });
    }

    const taxCategory =
      await this.taxCategoriesService.checkCouponTaxCategoryWithCountries(cart);

    const couponsLimit =
      (this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT') ?? 5) < 5
        ? this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT')
        : 5;

    const { promotions, availablePromotions } = await this.getPromotions(
      cart,
      uniqCoupons,
    );

    if (!uniqCoupons.length) {
      this.logger.debug({
        msg: 'No coupons applied, skipping voucherify call',
      });

      return {
        valid: false,
        availablePromotions: availablePromotions,
        applicableCoupons: [],
        notApplicableCoupons: [],
        skippedCoupons: [],
        productsToAdd: [],
        totalDiscountAmount: 0,
        couponsLimit,
      };
    }
    this.logger.debug({
      msg: 'Attempt to apply coupons',
      coupons: uniqCoupons,
      id,
      customerId,
      anonymousId,
    });

    const deletedCoupons = uniqCoupons.filter(
      (coupon) => coupon.status === 'DELETED',
    );

    deletedCoupons
      .filter((coupon) => coupon.type !== 'promotion_tier')
      .map((coupon) =>
        this.voucherifyConnectorService.releaseValidationSession(
          coupon.code,
          sessionKey,
        ),
      );

    if (deletedCoupons.length === uniqCoupons.length) {
      return {
        valid: false,
        availablePromotions: availablePromotions,
        applicableCoupons: [],
        notApplicableCoupons: [],
        skippedCoupons: [],
        productsToAdd: [],
        totalDiscountAmount: 0,
        couponsLimit,
      };
    }

    uniqCoupons = this.filterCouponsByLimit(uniqCoupons, couponsLimit);

    let validatedCoupons =
      await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
        uniqCoupons.filter((coupon) => coupon.status != 'DELETED'),
        cart,
        this.productMapper.mapLineItems(cart.lineItems),
        sessionKey,
      );

    const productsToAdd = await this.commercetoolsService.getProductsToAdd(
      validatedCoupons,
      this.commercetoolsService.getPriceSelectorFromCart(cart),
    );

    const productsToChange = productsToAdd.filter(
      (product) => product.discount_difference,
    );

    if (productsToChange.length) {
      validatedCoupons =
        await this.revalidateCouponsBecauseNewUnitTypeCouponHaveAppliedWithWrongPrice(
          validatedCoupons,
          productsToChange,
          uniqCoupons.filter((coupon) => coupon.status != 'DELETED'),
          cart,
          sessionKey,
        );
    }

    if (promotions.length) {
      this.setBannerOnValidatedPromotions(validatedCoupons, promotions);
    }

    const getCouponsByStatus = (status: StackableRedeemableResponseStatus) =>
      validatedCoupons.redeemables.filter(
        (redeemable) => redeemable.status === status,
      );

    const notApplicableCoupons = getCouponsByStatus('INAPPLICABLE');
    const skippedCoupons = getCouponsByStatus('SKIPPED');
    const applicableCoupons = getCouponsByStatus('APPLICABLE');

    const sessionKeyResponse = validatedCoupons.session?.key;
    const { valid } = validatedCoupons;
    const totalDiscountAmount = calculateTotalDiscountAmount(validatedCoupons);

    const onlyNewCouponsFailed = checkIfOnlyNewCouponsFailed(
      uniqCoupons,
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
    );

    const allInapplicableCouponsArePromotionTier =
      checkIfAllInapplicableCouponsArePromotionTier(notApplicableCoupons);

    this.logger.debug({
      msg: 'Validated coupons',
      availablePromotions,
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      id,
      valid,
      customerId,
      sessionKey,
      sessionKeyResponse,
      totalDiscountAmount,
      productsToAdd,
      onlyNewCouponsFailed,
      allInapplicableCouponsArePromotionTier,
      taxCategory,
      couponsLimit,
    });
    const newSessionKey = !sessionKey || valid ? sessionKeyResponse : null;

    return {
      availablePromotions,
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      newSessionKey,
      valid,
      totalDiscountAmount,
      productsToAdd,
      onlyNewCouponsFailed,
      allInapplicableCouponsArePromotionTier,
      taxCategory,
      couponsLimit,
    };
  }

  private async getPromotions(cart, uniqCoupons: Coupon[]) {
    const disableCartPromotion =
      this.configService.get<string>('DISABLE_CART_PROMOTION') ?? 'false';

    if (disableCartPromotion.toLowerCase() === 'true') {
      return { promotions: [], availablePromotions: [] };
    }

    const promotions =
      await this.voucherifyConnectorService.getAvailablePromotions(
        cart,
        this.productMapper.mapLineItems(cart.lineItems),
      );

    const availablePromotions = promotions
      .filter((promo) => {
        if (!uniqCoupons.length) {
          return true;
        }

        const codes = uniqCoupons
          .filter((coupon) => coupon.status !== 'DELETED')
          .map((coupon) => coupon.code);
        return !codes.includes(promo.id);
      })
      .map((promo) => {
        return {
          status: 'AVAILABLE',
          value: promo.discount_amount,
          banner: promo.banner,
          code: promo.id,
          type: promo.object,
        };
      });

    return { promotions, availablePromotions };
  }

  private setBannerOnValidatedPromotions(
    validatedCoupons: ValidationValidateStackableResponse,
    promotions,
  ) {
    const promotionTiersWithBanner = validatedCoupons.redeemables
      .filter((redeemable) => redeemable.object === 'promotion_tier')
      .map((redeemable) => {
        const appliedPromotion = promotions.find(
          (promotion) => promotion.id === redeemable.id,
        );
        if (appliedPromotion) {
          redeemable['banner'] = appliedPromotion?.banner;
        }

        return redeemable;
      });

    validatedCoupons.redeemables = [
      ...validatedCoupons.redeemables.filter(
        (element) => element.object !== 'promotion_tier',
      ),
      ...promotionTiersWithBanner,
    ];
  }

  private async revalidateCouponsBecauseNewUnitTypeCouponHaveAppliedWithWrongPrice(
    validatedCoupons: ValidationValidateStackableResponse,
    productsToChange: ProductToAdd[],
    coupons: Coupon[],
    cart: Cart,
    sessionKey?: string | null,
  ) {
    type OrderItemSku = {
      id?: string;
      source_id?: string;
      override?: boolean;
      sku?: string;
      price?: number;
    };
    const productsToChangeSKUs = productsToChange.map(
      (productsToChange) => productsToChange.product,
    );
    const items = validatedCoupons.order.items.map((item: OrdersItem) => {
      if (
        !productsToChangeSKUs.includes((item.sku as OrderItemSku).source_id) ||
        item.amount !== item.discount_amount
      ) {
        return item;
      }
      const currentProductToChange = productsToChange.find(
        (productsToChange) =>
          productsToChange.product === (item.sku as any).source_id,
      );
      return {
        object: item?.object,
        product_id: item?.product_id,
        sku_id: item?.sku_id,
        initial_quantity: item?.initial_quantity ?? 0,
        amount:
          currentProductToChange.applied_discount_amount *
          (item.quantity ?? item.initial_quantity ?? 0),
        price: currentProductToChange.applied_discount_amount,
        product: {
          id: item?.product?.id,
          source_id: item?.product?.source_id,
          name: item?.product?.name,
          price: currentProductToChange.applied_discount_amount,
        },
        sku: {
          id: item?.sku?.id,
          source_id: item?.sku?.source_id,
          sku: item?.sku?.sku,
          price: currentProductToChange.applied_discount_amount,
        },
      };
    });

    return await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
      coupons.filter((coupon) => coupon.status != 'DELETED'),
      cart,
      items,
      sessionKey,
    );
  }

  private filterCouponsByLimit(coupons: Coupon[], couponsLimit: number) {
    if (coupons.length > couponsLimit) {
      const couponsToRemove = coupons.length - couponsLimit;
      const newCouponsCodes = coupons
        .filter((coupon) => coupon.status === 'NEW')
        .map((coupon) => coupon.code);

      coupons = coupons.filter(
        (coupon) => !newCouponsCodes.includes(coupon.code),
      );

      if (newCouponsCodes.length < couponsToRemove) {
        coupons = coupons.splice(
          0,
          coupons.length - (couponsToRemove - newCouponsCodes.length),
        );
      }
    }
    return coupons;
  }
}
