import { Cart } from '@commercetools/platform-sdk';
import { Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
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
import { CartAction } from '../commercetools/cartActions/CartAction';
import { ConfigService } from '@nestjs/config';
import sleep from './utils/sleep';
import checkIfItemsQuantityIsEqualOrHigherThanItemTotalQuantityDiscount from './utils/checkIfItemsQuantityIsEqualOrHigherThanItemTotalQuantityDiscount';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { FREE_SHIPPING_UNIT_TYPE } from '../consts/voucherify';

const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

function getSession(cart: Cart): string | null {
  return cart.custom?.fields?.session ?? null;
}

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

  private async validateCoupons(
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

    const taxCategory = await this.checkCouponTaxCategoryWithCountries(cart);

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

    const productsToAdd = await this.convertUnitTypeCouponsToFreeProducts(
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

  private async checkCouponTaxCategoryWithCountries(cart: Cart) {
    const { country } = cart;
    const taxCategory = await this.taxCategoriesService.getCouponTaxCategory();
    if (!taxCategory) {
      const msg = 'Coupon tax category was not configured correctly';
      this.logger.error({ msg });
      throw new Error(msg);
    }

    if (
      country &&
      !taxCategory?.rates?.find((rate) => rate.country === country)
    ) {
      await this.taxCategoriesService.addCountryToCouponTaxCategory(
        taxCategory,
        country,
      );
    }

    return taxCategory;
  }

  private async setCustomTypeForInitializedCart(): Promise<CartResponse> {
    const couponType = await this.typesService.findCouponType('couponCodes');
    if (!couponType) {
      const msg = 'CouponType not found';
      this.logger.error({ msg });
      throw new Error(msg);
    }

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

  async validatePromotionsAndBuildCartActions(cart: Cart): Promise<{
    validateCouponsResult?: ValidateCouponsResult;
    actions: CartAction[];
    status: boolean;
  }> {
    if (cart.version === 1) {
      return this.setCustomTypeForInitializedCart();
    }

    if (
      checkIfItemsQuantityIsEqualOrHigherThanItemTotalQuantityDiscount(
        cart.lineItems,
      )
    ) {
      return null;
    }

    const validateCouponsResult = await this.validateCoupons(
      cart,
      getSession(cart),
    );

    const cartDiscountApplyMode =
      this.configService.get<string>(
        'APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT',
      ) === 'true'
        ? CartDiscountApplyMode.DirectDiscount
        : CartDiscountApplyMode.CustomLineItem;

    const actions = getCartActionBuilders()
      .flatMap((builder) =>
        builder(cart, validateCouponsResult, cartDiscountApplyMode),
      )
      .filter((e) => e);

    this.logger.debug({ msg: 'actions', actions });
    return {
      status: true,
      actions: actions,
      validateCouponsResult,
    };
  }

  async validatePromotionsAndBuildCartActionsFallback(cart: Cart) {
    let cartMutated = false;
    for (let i = 0; i < 2; i++) {
      await sleep(500);
      const updatedCart = await this.commerceToolsConnectorService.findCart(
        cart.id,
      );
      if (updatedCart.version !== cart.version) {
        cartMutated = true;
        break;
      }
    }
    if (cartMutated) {
      return;
    }
    await this.validateCoupons(cart, getSession(cart));
    return this.logger.debug('Coupons changes were rolled back successfully');
  }

  public async convertUnitTypeCouponsToFreeProducts(
    response: ValidationValidateStackableResponse,
    priceSelector: PriceSelector,
  ): Promise<ProductToAdd[]> {
    const discountTypeUnit = response.redeemables.filter(
      (redeemable) =>
        redeemable.result?.discount?.type === 'UNIT' &&
        redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE,
    );
    const freeProductsToAdd = discountTypeUnit.flatMap(
      async (unitTypeRedeemable) => {
        const { effect: discountEffect } = unitTypeRedeemable.result?.discount;
        if (APPLICABLE_PRODUCT_EFFECT.includes(discountEffect)) {
          const freeItem = unitTypeRedeemable.order?.items?.find(
            (item: OrdersItem) =>
              item.sku?.source_id ===
              unitTypeRedeemable.result?.discount?.sku?.source_id,
          ) as OrdersItem;
          const productSourceId =
            unitTypeRedeemable.result.discount.product.source_id;
          const productSkuSourceId =
            unitTypeRedeemable.result.discount.sku.source_id;
          const ctProducts =
            await this.commerceToolsConnectorService.getCtProducts(
              [productSourceId],
              priceSelector,
            );
          const prices = await this.commercetoolsService.getCtVariantPrice(
            ctProducts.body.results[0],
            productSkuSourceId,
            priceSelector,
          );
          const currentPrice = prices[0];
          const currentPriceAmount = currentPrice
            ? currentPrice.value.centAmount
            : 0;

          return [
            {
              code: unitTypeRedeemable.id,
              effect: unitTypeRedeemable.result?.discount?.effect,
              quantity: unitTypeRedeemable.result?.discount?.unit_off,
              product: unitTypeRedeemable.result?.discount.sku.source_id,
              initial_quantity: freeItem?.initial_quantity,
              discount_quantity: freeItem?.discount_quantity,
              discount_difference:
                freeItem?.applied_discount_amount -
                  currentPriceAmount * freeItem?.discount_quantity !==
                0,
              applied_discount_amount: currentPriceAmount,
              distributionChannel: priceSelector.distributionChannels[0],
            } as ProductToAdd,
          ] as ProductToAdd[];
        }

        if (discountEffect === 'ADD_MANY_ITEMS') {
          const filteredProducts =
            unitTypeRedeemable.result.discount.units.filter((product) =>
              APPLICABLE_PRODUCT_EFFECT.includes(product.effect),
            );
          const productSourceIds = filteredProducts.map((product) => {
            return product.product.source_id;
          });
          const ctProducts =
            await this.commerceToolsConnectorService.getCtProducts(
              productSourceIds,
              priceSelector,
            );

          const productsToAdd = filteredProducts.map(async (product) => {
            const freeItem = unitTypeRedeemable.order?.items?.find(
              (item: OrdersItem) =>
                item.sku.source_id === product.sku.source_id,
            ) as OrdersItem;
            const ctProduct = ctProducts.body.results.filter((ctProduct) => {
              return ctProduct.id === product.product.source_id;
            })[0];
            const prices = await this.commercetoolsService.getCtVariantPrice(
              ctProduct,
              product.sku.source_id,
              priceSelector,
            );
            const currentPrice = prices[0];
            const currentPriceAmount = currentPrice
              ? currentPrice.value.centAmount
              : 0;
            return {
              code: unitTypeRedeemable.id,
              effect: product.effect,
              quantity: product.unit_off,
              product: product.sku.source_id,
              initial_quantity: freeItem.initial_quantity,
              discount_quantity: freeItem.discount_quantity,
              discount_difference:
                freeItem?.applied_discount_amount -
                  currentPriceAmount * freeItem?.discount_quantity !==
                0,
              applied_discount_amount: currentPriceAmount,
              distributionChannel: priceSelector.distributionChannels[0],
            } as ProductToAdd;
          });

          return Promise.all(productsToAdd);
        }

        return [] as ProductToAdd[];
      },
    );

    return Promise.all(freeProductsToAdd).then((response) => {
      return response.flatMap((element) => {
        return element;
      });
    });
  }
}
