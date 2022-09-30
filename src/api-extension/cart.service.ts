import { Cart, LineItem } from '@commercetools/platform-sdk';
import { Injectable, Logger } from '@nestjs/common';
import {
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';

import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../commerceTools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import getCartActionBuilders from './cartActions/getCartActionBuilders';
import convertUnitTypeCouponsToFreeProducts from './convertUnitTypeCouponsToFreeProducts';
import { desarializeCoupons, Coupon, CouponStatus } from './coupon';
import { CartResponse, PriceSelector, ValidateCouponsResult } from './types';
import { CommerceToolsConnectorService } from '../commerceTools/commerce-tools-connector.service';
import { ProductMapper } from './mappers/product';
import {
  CartAction,
  CartActionAddLineItem,
  CartActionRemoveLineItem,
  CartActionSetLineItemCustomType,
} from './cartActions/CartAction';
import { ConfigService } from '@nestjs/config';
import sleep from './utils/sleep';
import checkIfItemsQuantityIsEqualOrHigherThanItemTotalQuantityDiscount from './utils/checkIfItemsQuantityIsEqualOrHigherThanItemTotalQuantityDiscount';

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
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly productMapper: ProductMapper,
    private readonly configService: ConfigService,
  ) {}

  private async validateCoupons(
    cart: Cart,
    sessionKey?: string | null,
  ): Promise<ValidateCouponsResult> {
    const { id, customerId, anonymousId } = cart;
    let coupons: Coupon[] = getCouponsFromCart(cart);
    const taxCategory = await this.checkCouponTaxCategoryWithCountries(cart);

    const couponsLimit =
      (this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT') ?? 5) < 5
        ? this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT')
        : 5;

    const promotions =
      await this.voucherifyConnectorService.getAvailablePromotions(
        cart,
        this.productMapper.mapLineItems(cart.lineItems),
      );

    const availablePromotions = promotions
      .filter((promo) => {
        if (!coupons.length) {
          return true;
        }

        const codes = coupons
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

    if (!coupons.length) {
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
      coupons,
      id,
      customerId,
      anonymousId,
    });

    const deletedCoupons = coupons.filter(
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

    if (deletedCoupons.length === coupons.length) {
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

    coupons = this.filterCouponsByLimit(coupons, couponsLimit);

    let validatedCoupons =
      await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
        coupons.filter((coupon) => coupon.status != 'DELETED'),
        cart,
        this.productMapper.mapLineItems(cart.lineItems),
        sessionKey,
      );

    const productsToAdd = await convertUnitTypeCouponsToFreeProducts(
      validatedCoupons,
      this.commerceToolsConnectorService.getClient(),
      this.getPriceSelectorFromCart(cart),
    );

    const productsToChange = productsToAdd.filter(
      (product) => product.discount_difference,
    );

    if (productsToChange.length) {
      const productsToChangeSKUs = productsToChange.map(
        (productsToChange) => productsToChange.product,
      );
      let items = validatedCoupons.order.items;
      items = items.map((item: any) => {
        if (
          !productsToChangeSKUs.includes((item.sku as any).source_id) ||
          item.amount !== item.discount_amount
        ) {
          return item;
        }
        const currentProductToChange = productsToChange.find(
          (productsToChange) =>
            productsToChange.product === (item.sku as any).source_id,
        );

        delete item.amount;
        delete item.quantity;

        item.price = currentProductToChange.applied_discount_amount;
        item.amount = item.price * (item.quantity ?? item.initial_quantity);
        item.sku = {
          ...item.sku,
          price: currentProductToChange.applied_discount_amount,
        };
        if (item.product) {
          item.product = {
            ...item.product,
            price: currentProductToChange.applied_discount_amount,
          };

          return item;
        }
      });

      items = items.map((item: any) => {
        delete item.initial_amount;
        delete item.discount_amount;
        delete item.applied_discount_amount;
        delete item.subtotal_amount;
        delete item.quantity;
        delete item.discount_quantity;

        return item;
      });

      validatedCoupons =
        await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
          coupons.filter((coupon) => coupon.status != 'DELETED'),
          cart,
          items,
          sessionKey,
        );
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
      coupons,
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

    const actions = getCartActionBuilders(validateCouponsResult)
      .flatMap((builder) => builder(cart, validateCouponsResult))
      .filter((e) => e);

    const normalizedCartActions = this.normalizeCartActions(
      actions,
      cart.lineItems,
    );
    this.logger.debug(normalizedCartActions);
    return {
      status: true,
      actions: normalizedCartActions,
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

  // TODO: make service for this if logic goes bigger
  private normalizeCartActions(
    actions: CartAction[],
    lineItems: LineItem[],
  ): CartAction[] {
    const allActionsSetLineItemCustomType = actions.filter(
      (action) => action?.action === 'setLineItemCustomType',
    );

    const actionsRemoveLineItem = actions.filter(
      (action) => action?.action === 'removeLineItem',
    );

    // If lineItem is going to be removed we don't want to set customField on it.
    const removeLineItemIdsWithQuantity = actionsRemoveLineItem.map(
      (action: CartActionRemoveLineItem) => {
        return {
          lineItemId: action.lineItemId,
          quantity: action.quantity,
        };
      },
    );

    const processedSetLineItemIds = [];
    const processedActionsSetLineItemCustomType =
      allActionsSetLineItemCustomType
        .map((action: CartActionSetLineItemCustomType) => {
          if (
            !processedSetLineItemIds.includes(action.lineItemId) &&
            // We need to decide if this case remove item from cart or only will change quantity to lower
            removeLineItemIdsWithQuantity
              .filter((element) => element.lineItemId === action.lineItemId)
              .reduce((acc, element) => acc + element.quantity, 0) <
              lineItems
                .filter((lineItem) => lineItem.id === action.lineItemId)
                .reduce((acc, lineItems) => acc + lineItems.quantity, 0)
          ) {
            processedSetLineItemIds.push(action.lineItemId);
            return {
              action: action.action,
              lineItemId: action.lineItemId,
              type: action.type,
              fields: Object.assign(
                {},
                ...allActionsSetLineItemCustomType
                  .filter(
                    (innerAction: CartActionSetLineItemCustomType) =>
                      innerAction.lineItemId === action.lineItemId,
                  )
                  .map((innerAction: CartActionSetLineItemCustomType) => {
                    return innerAction.fields;
                  }),
              ),
            } as CartActionSetLineItemCustomType;
          }
        })
        .filter(
          (action: CartActionSetLineItemCustomType) => action !== undefined,
        );

    const allActionsAddLineItem = actions.filter(
      (action) => action?.action === 'addLineItem',
    );
    const processedAddLineItemIds = [];
    const processedAddLineItems = [];
    for (const currentAction of allActionsAddLineItem as CartActionAddLineItem[]) {
      //We delete duplicates
      if (!processedAddLineItemIds.includes(currentAction.sku)) {
        processedAddLineItemIds.push(currentAction.sku);
        processedAddLineItems.push(currentAction);
      }
    }

    actions = actions.filter(
      (action) =>
        action?.action !== 'setLineItemCustomType' &&
        action?.action !== 'addLineItem',
    );

    return [
      ...actions,
      ...processedActionsSetLineItemCustomType,
      ...processedAddLineItems,
    ];
  }

  private getPriceSelectorFromCart(cart: Cart): PriceSelector {
    return {
      country: cart.country,
      currencyCode: cart.totalPrice.currencyCode,
      customerGroup: cart.customerGroup,
      distributionChannels: [
        ...new Set(
          cart.lineItems
            .map((item) => item.distributionChannel)
            .filter((item) => item != undefined),
        ),
      ],
    };
  }
}
