import { Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  RedemptionsRedeemStackableResponse,
  StackableRedeemableResponse,
} from '@voucherify/sdk';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import {
  AvailablePromotion,
  Cart,
  CartUpdateActionsInterface,
  Coupon,
  Order,
  OrderPaidActionsInterface,
  ProductPriceAndSourceId,
  ProductToAdd,
  Promotions,
  SentCoupons,
  StackableRedeemableResultDiscountUnitWithCodeAndPrice,
  ValidatedCoupons,
} from './types';
import { mapItemsToVoucherifyOrdersItems } from './utils/mappers/product';
import { ConfigService } from '@nestjs/config';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { VoucherifyService } from '../voucherify/voucherify.service';
import {
  filterOutRedeemablesIfCodeIn,
  getRedeemablesByStatus,
  getRedeemablesByStatuses,
  redeemablesToCodes,
  stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes,
  stackableResponseToUnitTypeRedeemables,
  unitTypeRedeemablesToOrderItems,
} from './utils/redeemableOperationFunctions';
import { buildValidationsValidateStackableParamsForVoucherify } from './utils/mappers/buildValidationsValidateStackableParamsForVoucherify';
import { buildRedeemStackableRequestForVoucherify } from './utils/mappers/buildRedeemStackableRequestForVoucherify';
import { replaceCodesWithInapplicableCoupons } from './utils/replaceCodesWithInapplicableCoupons';
import {
  codesFromCoupons,
  couponsStatusDeleted,
  couponsStatusNew,
  filterOutCouponsIfCodeIn,
  filterOutCouponsTypePromotionTier,
  uniqueCouponsByCodes,
} from './utils/couponsOperationFunctions';
import { getIncorrectPrices } from './utils/getIncorrectPrices';
import { getCodesIfProductNotFoundIn } from './utils/getCodesIfProductNotFoundIn';
import { getItemsWithCorrectedPrices } from './utils/getItemsWithPricesCorrected';
import { getProductsToAdd } from './utils/getProductsToAddWithPricesCorrected';
import { getOrderMetadata } from './utils/getOrderMetadata';
import { getInvalidCodesDueRemovedItems } from './utils/getInvalidCodesDueRemovedItems';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly logger: Logger,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly configService: ConfigService,
    private readonly storeService: CommercetoolsService,
    private readonly voucherifyService: VoucherifyService,
  ) {
    this.storeService.setCartUpdateListener((cart, storeActions) =>
      this.validateCouponsAndGetAvailablePromotions(cart, storeActions),
    );
    this.storeService.setOrderPaidListener((order, storeActions) =>
      this.redeemVoucherifyCoupons(order, storeActions),
    );
  }

  private setAvailablePromotions(
    cartUpdateActions: CartUpdateActionsInterface,
    availablePromotions: AvailablePromotion[],
  ) {
    cartUpdateActions?.setAvailablePromotions?.(availablePromotions);
  }

  private getInapplicableRedeemables(validatedCoupons: ValidatedCoupons) {
    return getRedeemablesByStatuses(
      [
        ...(validatedCoupons.redeemables || []),
        ...(validatedCoupons.inapplicable_redeemables || []),
        ...(validatedCoupons.skipped_redeemables || []),
      ],
      ['INAPPLICABLE', 'SKIPPED'],
    );
  }

  private async validateCoupons(coupons: Coupon[], cart: Cart) {
    return await this.voucherifyConnectorService.validateStackableVouchers(
      buildValidationsValidateStackableParamsForVoucherify(
        coupons,
        cart,
        mapItemsToVoucherifyOrdersItems(cart.items),
      ),
    );
  }

  private async getPricesOfProductsFromCommercetools(
    cartUpdateActions: CartUpdateActionsInterface,
    stackableRedeemablesResultDiscountUnitWithPriceAndCodes: StackableRedeemableResultDiscountUnitWithCodeAndPrice[],
  ) {
    return (
      (await cartUpdateActions.getPricesOfProductsFromCommercetools?.(
        stackableRedeemablesResultDiscountUnitWithPriceAndCodes,
      )) || { found: [], notFound: [] }
    );
  }

  private async getCorrectPrices(
    currentPricesOfProducts: ProductPriceAndSourceId[],
    unitTypeRedeemables: StackableRedeemableResponse[],
    codesWithMissingProductsToAdd: string[],
    validatedCoupons: ValidatedCoupons,
    couponsAppliedAndNewLimitedByConfig: Coupon[],
    cart: Cart,
  ): Promise<ValidatedCoupons> {
    const pricesIncorrect = getIncorrectPrices(
      currentPricesOfProducts,
      unitTypeRedeemablesToOrderItems(unitTypeRedeemables),
    );

    if (
      filterOutCouponsIfCodeIn(
        couponsAppliedAndNewLimitedByConfig,
        codesWithMissingProductsToAdd,
      ).length > 0 &&
      pricesIncorrect.length
    ) {
      const itemsWithPricesCorrected = getItemsWithCorrectedPrices(
        validatedCoupons.order.items,
        cart.items,
        pricesIncorrect,
      );

      validatedCoupons =
        await this.voucherifyConnectorService.validateStackableVouchers(
          buildValidationsValidateStackableParamsForVoucherify(
            filterOutCouponsIfCodeIn(
              couponsAppliedAndNewLimitedByConfig,
              codesWithMissingProductsToAdd,
            ),
            cart,
            itemsWithPricesCorrected,
          ),
        );
    }

    return validatedCoupons;
  }

  private async updateCart(
    cartUpdateActions: CartUpdateActionsInterface | undefined,
    validatedCoupons: ValidatedCoupons,
    codesWithMissingProductsToAdd: string[],
    promotions: Promotions,
    productsToAdd: ProductToAdd[],
    inapplicableRedeemables: StackableRedeemableResponse[],
  ) {
    cartUpdateActions?.setSessionKey?.(validatedCoupons?.session?.key);
    cartUpdateActions?.setTotalDiscountAmount?.(
      validatedCoupons?.order?.total_applied_discount_amount || 0,
    );
    cartUpdateActions?.setApplicableCoupons?.(
      this.voucherifyService.setBannerOnValidatedPromotions(
        filterOutRedeemablesIfCodeIn(
          getRedeemablesByStatus(validatedCoupons?.redeemables, 'APPLICABLE'),
          codesWithMissingProductsToAdd,
        ),
        promotions,
      ),
    );
    cartUpdateActions?.setInapplicableCoupons?.(inapplicableRedeemables);
    cartUpdateActions?.setProductsToAdd?.(productsToAdd);
  }

  private async getMetadataOptions(
    order: Order,
    orderPaidActions: OrderPaidActionsInterface,
  ) {
    const orderMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'order',
      );

    const productMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'product',
      );

    const orderMetadata = await getOrderMetadata(
      order?.rawOrder,
      orderMetadataSchemaProperties,
      orderPaidActions.getCustomMetadataForOrder,
    );

    return { orderMetadata, productMetadataSchemaProperties };
  }

  private async redeemStackableVouchers(
    order: Order,
    items: OrdersItem[],
    orderMetadata: Record<string, string>,
  ) {
    try {
      const response =
        await this.voucherifyConnectorService.redeemStackableVouchers(
          buildRedeemStackableRequestForVoucherify(order, items, orderMetadata),
        );

      return { response };
    } catch (e) {
      console.log(e); //can't use the logger because it cannot handle error objects
      this.logger.debug({ msg: 'Redeem operation failed', error: e.details });
      return { status: true, actions: [] };
    }
  }

  private async segregateCouponsByResult(
    response: RedemptionsRedeemStackableResponse,
  ) {
    const sentCoupons: SentCoupons[] = [];
    const usedCoupons: string[] = [];
    const notUsedCoupons: string[] = [];

    sentCoupons.push(
      ...response.redemptions.map((redeem) => {
        return {
          result: redeem.result,
          coupon: redeem.voucher?.code
            ? redeem.voucher.code
            : redeem['promotion_tier']['id'],
        };
      }),
    );

    sentCoupons.forEach((sentCoupon) => {
      if (sentCoupon.result === 'SUCCESS') {
        usedCoupons.push(sentCoupon.coupon);
      } else {
        notUsedCoupons.push(sentCoupon.coupon);
      }
    });

    return { usedCoupons, notUsedCoupons };
  }

  private createActions(usedCoupons: string[], notUsedCoupons: string[]) {
    return [
      {
        action: 'setCustomField',
        name: 'discount_codes',
        value: notUsedCoupons,
      },
      {
        action: 'setCustomField',
        name: 'used_codes',
        value: usedCoupons,
      },
    ];
  }

  public async validateCouponsAndGetAvailablePromotions(
    cart: Cart,
    cartUpdateActions?: CartUpdateActionsInterface,
  ): Promise<undefined> {
    const {
      id,
      customerId,
      anonymousId,
      sessionKey,
      coupons: couponsFromRequest,
    } = cart;
    const uniqueCoupons: Coupon[] = uniqueCouponsByCodes(couponsFromRequest);
    if (couponsFromRequest.length !== uniqueCoupons.length) {
      this.logger.debug({
        msg: 'COUPONS: Duplicates found and deleted',
      });
    }

    const newCoupons: Coupon[] = couponsStatusNew(uniqueCoupons);

    let { promotions, availablePromotions } =
      await this.voucherifyService.getPromotions(cart, uniqueCoupons);

    this.setAvailablePromotions(cartUpdateActions, availablePromotions);

    if (!uniqueCoupons.length) {
      this.logger.debug({
        msg: 'No coupons applied, skipping voucherify call',
      });
      return;
    }

    const deletedCoupons = couponsStatusDeleted(uniqueCoupons);
    await this.voucherifyConnectorService.releaseValidationSession(
      codesFromCoupons(filterOutCouponsTypePromotionTier(deletedCoupons)),
      sessionKey,
    );

    if (deletedCoupons.length === uniqueCoupons.length) {
      this.logger.debug({
        msg: 'Deleting coupons only, skipping voucherify call',
      });

      return;
    }

    this.logger.debug({
      msg: 'Attempt to apply coupons',
      coupons: uniqueCoupons,
      id,
      customerId,
      anonymousId,
    });

    const notDeletedCoupons = filterOutCouponsIfCodeIn(
      uniqueCoupons,
      deletedCoupons.map((coupon) => coupon.code),
    );

    let validatedCoupons = await this.validateCoupons(notDeletedCoupons, cart);

    const inapplicableRedeemables =
      this.getInapplicableRedeemables(validatedCoupons);

    const inapplicableCodes = redeemablesToCodes(inapplicableRedeemables);

    let applicableCoupons = filterOutCouponsIfCodeIn(
      notDeletedCoupons,
      inapplicableCodes,
    );
    const invalidCodesDueRemovedItems = getInvalidCodesDueRemovedItems(
      validatedCoupons,
      applicableCoupons,
      cart,
    );
    inapplicableRedeemables.push(
      ...replaceCodesWithInapplicableCoupons(
        invalidCodesDueRemovedItems,
        'You have removed product that was part of the discount',
      ),
    );

    applicableCoupons = filterOutCouponsIfCodeIn(notDeletedCoupons, [
      ...inapplicableCodes,
      ...invalidCodesDueRemovedItems,
    ]);
    if (invalidCodesDueRemovedItems.length > 0) {
      await this.voucherifyConnectorService.releaseValidationSession(
        invalidCodesDueRemovedItems,
        sessionKey,
      );
      ({ promotions, availablePromotions } =
        await this.voucherifyService.getPromotions(cart, applicableCoupons));
      this.setAvailablePromotions(cartUpdateActions, availablePromotions);
    }

    if (
      (!Array.isArray(validatedCoupons?.inapplicable_redeemables) &&
        validatedCoupons.valid === false) ||
      invalidCodesDueRemovedItems.length
    ) {
      if (applicableCoupons.length === 0) {
        return;
      }
      validatedCoupons = await this.validateCoupons(applicableCoupons, cart);
    }

    const unitTypeRedeemables = stackableResponseToUnitTypeRedeemables(
      validatedCoupons,
      newCoupons,
    );
    const stackableRedeemablesResultDiscountUnitWithPriceAndCodes =
      stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes(
        unitTypeRedeemables,
      );

    const {
      found: currentPricesOfProducts,
      notFound: notFoundProductSourceIds,
    }: {
      found: ProductPriceAndSourceId[];
      notFound: string[];
    } = await this.getPricesOfProductsFromCommercetools(
      cartUpdateActions,
      stackableRedeemablesResultDiscountUnitWithPriceAndCodes,
    );

    const codesWithMissingProductsToAdd = getCodesIfProductNotFoundIn(
      stackableRedeemablesResultDiscountUnitWithPriceAndCodes,
      notFoundProductSourceIds,
    );

    //don't wait
    this.voucherifyConnectorService.releaseValidationSession(
      codesWithMissingProductsToAdd,
      validatedCoupons?.session?.key ?? sessionKey,
    );

    const validatedCouponsWithCorrectPrices = await this.getCorrectPrices(
      currentPricesOfProducts,
      unitTypeRedeemables,
      codesWithMissingProductsToAdd,
      validatedCoupons,
      notDeletedCoupons,
      cart,
    );

    const productsToAdd: ProductToAdd[] =
      validatedCouponsWithCorrectPrices?.order
        ? getProductsToAdd(
            validatedCouponsWithCorrectPrices,
            currentPricesOfProducts,
            newCoupons,
          )
        : [];

    this.logger.debug({
      validatedCouponsWithCorrectPrices,
      availablePromotions,
      productsToAdd,
    });

    cartUpdateActions.setCouponsLimit(
      validatedCouponsWithCorrectPrices.stacking_rules.redeemables_limit,
    );

    await this.updateCart(
      cartUpdateActions,
      validatedCouponsWithCorrectPrices,
      codesWithMissingProductsToAdd,
      promotions,
      productsToAdd,
      inapplicableRedeemables,
    );

    return;
  }

  public async redeemVoucherifyCoupons(
    order: Order,
    orderPaidActions: OrderPaidActionsInterface,
  ) {
    const { id, customerId } = order;

    //schema of order & product metadata
    const { orderMetadata, productMetadataSchemaProperties } =
      await this.getMetadataOptions(order, orderPaidActions);

    const items = mapItemsToVoucherifyOrdersItems(
      order.items,
      productMetadataSchemaProperties,
    );

    const coupons: Coupon[] = (order.coupons ?? []).filter(
      (coupon) =>
        coupon.status !== 'NOT_APPLIED' && coupon.status !== 'DELETED',
    );

    if (!coupons.length) {
      this.logger.debug({
        msg: 'Attempt to add order without coupons',
        id,
        customerId,
      });

      await this.voucherifyConnectorService.createOrder(
        order,
        items,
        orderMetadata,
      );

      return { status: true, actions: [] };
    }

    this.logger.debug({
      msg: 'Attempt to redeem vouchers',
      coupons,
      id,
      customerId,
    });

    const { response } = await this.redeemStackableVouchers(
      order,
      items,
      orderMetadata,
    );

    this.logger.debug({
      msg: 'Voucherify redeem response',
      id,
      customerId,
      redemptions: response?.redemptions,
    });

    const { usedCoupons, notUsedCoupons } = await this.segregateCouponsByResult(
      response,
    );

    this.logger.debug({
      msg: 'Realized coupons',
      id,
      customerId,
      usedCoupons,
      notUsedCoupons,
    });

    const actions = this.createActions(usedCoupons, notUsedCoupons);

    return {
      status: true,
      actions: actions,
      redemptionsRedeemStackableResponse: response,
    };
  }
}
