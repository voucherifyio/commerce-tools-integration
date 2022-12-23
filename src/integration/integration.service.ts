import { Injectable, Logger } from '@nestjs/common';
import {
  RedemptionsRedeemStackableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';

import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { CustomTypesService } from '../commercetools/custom-types/custom-types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import {
  Cart,
  Coupon,
  ProductToAdd,
  SentCoupons,
  Order,
  CartUpdateActionsInterface,
  OrderPaidActionsInterface,
  ProductPriceAndSourceId,
} from './types';
import { mapItemsToVoucherifyOrdersItems } from './utils/mappers/product';
import { ConfigService } from '@nestjs/config';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { VoucherifyService } from '../voucherify/voucherify.service';
import { calculateTotalDiscountAmount } from './utils/helperFunctions';
import {
  redeemablesToCodes,
  filterOutRedeemablesIfCodeIn,
  getRedeemablesByStatus,
  stackableRedeemablesResponseToUnitStackableRedeemablesResultDiscountUnitWithCodes,
  stackableResponseToUnitTypeRedeemables,
  unitTypeRedeemablesToOrderItems,
} from './utils/redeemableOperationFunctions';
import { buildValidationsValidateStackableParamsForVoucherify } from './utils/mappers/buildValidationsValidateStackableParamsForVoucherify';
import { buildRedeemStackableRequestForVoucherify } from './utils/mappers/buildRedeemStackableRequestForVoucherify';
import { getSimpleMetadataForOrder } from '../commercetools/utils/mappers/getSimpleMetadataForOrder';
import { mergeTwoObjectsIntoOne } from './utils/mergeTwoObjectsIntoOne';
import { replaceCodesWithInapplicableCoupons } from './utils/replaceCodesWithInapplicableCoupons';
import {
  couponsStatusDeleted,
  filterOutCouponsTypePromotionTier,
  filterCouponsStatusAppliedAndNewByLimit,
  codesFromCoupons,
  uniqueCouponsByCodes,
  filterOutCouponsIfCodeIn,
} from './utils/couponsOperationFunctions';
import { getIncorrectPrices } from './utils/getIncorrectPrices';
import { getCodesIfProductNotFoundIn } from './utils/getCodesIfProductNotFoundIn';
import { getItemsWithCorrectedPrices } from './utils/getItemsWithPricesCorrected';
import { getProductsToAdd } from './utils/getProductsToAddWithPricesCorrected';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: CustomTypesService,
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
      items,
    } = cart;
    const uniqueCoupons: Coupon[] = uniqueCouponsByCodes(couponsFromRequest);
    if (couponsFromRequest.length !== uniqueCoupons.length) {
      this.logger.debug({
        msg: 'COUPONS: Duplicates found and deleted',
      });
    }

    const { promotions, availablePromotions } =
      await this.voucherifyService.getPromotions(cart, uniqueCoupons);

    if (typeof cartUpdateActions?.setAvailablePromotions === 'function') {
      cartUpdateActions.setAvailablePromotions(availablePromotions);
    }

    if (!uniqueCoupons.length) {
      this.logger.debug({
        msg: 'No coupons applied, skipping voucherify call',
      });
      return;
    }

    const deletedCoupons = couponsStatusDeleted(uniqueCoupons);
    //don't wait
    this.voucherifyConnectorService.releaseValidationSession(
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

    const couponsAppliedAndNewLimitedByConfig =
      filterCouponsStatusAppliedAndNewByLimit(
        uniqueCoupons,
        this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT'),
      );

    let validatedCoupons: ValidationValidateStackableResponse =
      await this.voucherifyConnectorService.validateStackableVouchers(
        buildValidationsValidateStackableParamsForVoucherify(
          couponsAppliedAndNewLimitedByConfig,
          cart,
          mapItemsToVoucherifyOrdersItems(items),
        ),
      );

    const inapplicableRedeemables = getRedeemablesByStatus(
      validatedCoupons.redeemables,
      'INAPPLICABLE',
    );
    const inapplicableCodes = redeemablesToCodes(inapplicableRedeemables);

    if (validatedCoupons.valid === false) {
      const applicableCodes = couponsAppliedAndNewLimitedByConfig.filter(
        (coupon) => !inapplicableCodes.includes(coupon.code),
      );
      if (applicableCodes.length === 0) {
        cartUpdateActions.setInapplicableCoupons(inapplicableRedeemables);
        return;
      }
      //We need to do another call to V% if there is any applicable coupon in the cart
      //to get definitions of discounts we should apply on the cart
      validatedCoupons =
        await this.voucherifyConnectorService.validateStackableVouchers(
          buildValidationsValidateStackableParamsForVoucherify(
            applicableCodes,
            cart,
            mapItemsToVoucherifyOrdersItems(items),
          ),
        );
    }

    const unitTypeRedeemables =
      stackableResponseToUnitTypeRedeemables(validatedCoupons);
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
    } =
      typeof cartUpdateActions.getPricesOfProductsFromCommercetools ===
      'function'
        ? await cartUpdateActions.getPricesOfProductsFromCommercetools(
            stackableRedeemablesResultDiscountUnitWithPriceAndCodes,
          )
        : { found: [], notFound: [] };

    const codesWithMissingProductsToAdd = getCodesIfProductNotFoundIn(
      stackableRedeemablesResultDiscountUnitWithPriceAndCodes,
      notFoundProductSourceIds,
    );

    const pricesIncorrect = getIncorrectPrices(
      currentPricesOfProducts,
      unitTypeRedeemablesToOrderItems(unitTypeRedeemables),
    );

    //don't wait
    this.voucherifyConnectorService.releaseValidationSession(
      codesWithMissingProductsToAdd,
      validatedCoupons?.session?.key ?? sessionKey,
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
        items,
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

    const productsToAdd: ProductToAdd[] = getProductsToAdd(
      validatedCoupons,
      currentPricesOfProducts,
    );

    this.logger.debug({
      msg: 'Validated coupons',
      validatedCoupons,
      availablePromotions,
      productsToAdd,
    });

    if (
      typeof cartUpdateActions.setSessionKey !== 'function' ||
      typeof cartUpdateActions.setTotalDiscountAmount !== 'function' ||
      typeof cartUpdateActions.setApplicableCoupons !== 'function' ||
      typeof cartUpdateActions.setInapplicableCoupons !== 'function' ||
      typeof cartUpdateActions.setProductsToAdd !== 'function'
    ) {
      return;
    }

    cartUpdateActions.setSessionKey(validatedCoupons?.session?.key);
    cartUpdateActions.setTotalDiscountAmount(
      calculateTotalDiscountAmount(validatedCoupons),
    );
    cartUpdateActions.setApplicableCoupons(
      this.voucherifyService.extendRedeemablesBannerByPromotionsBanner(
        filterOutRedeemablesIfCodeIn(
          getRedeemablesByStatus(validatedCoupons.redeemables, 'APPLICABLE'),
          codesWithMissingProductsToAdd,
        ),
        promotions,
      ),
    );
    cartUpdateActions.setInapplicableCoupons([
      ...inapplicableRedeemables,
      ...replaceCodesWithInapplicableCoupons(codesWithMissingProductsToAdd),
    ]);
    cartUpdateActions.setProductsToAdd(productsToAdd);
  }

  public async redeemVoucherifyCoupons(
    order: Order,
    orderPaidActions: OrderPaidActionsInterface,
  ) {
    const { id, customerId } = order;

    //products metadata
    const productMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'product',
      );

    const items = mapItemsToVoucherifyOrdersItems(
      order.items,
      productMetadataSchemaProperties,
    );

    //order metadata
    const orderMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'order',
      );

    const orderMetadata = await this.calculateOrederMetadata(
      order,
      orderMetadataSchemaProperties,
      orderPaidActions,
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

    let redemptionResponse: RedemptionsRedeemStackableResponse;
    try {
      redemptionResponse =
        await this.voucherifyConnectorService.redeemStackableVouchers(
          buildRedeemStackableRequestForVoucherify(order, items, orderMetadata),
        );
    } catch (e) {
      console.log(e); // Can't use the logger because it cannot handle error objects
      this.logger.debug({ msg: 'Redeem operation failed', error: e.details });
      return { status: true, actions: [] };
    }

    this.logger.debug({
      msg: 'Voucherify redeem response',
      id,
      customerId,
      redemptions: redemptionResponse?.redemptions,
    });

    const sentCoupons: SentCoupons[] = redemptionResponse.redemptions.map(
      (redeem) => {
        return {
          result: redeem.result,
          coupon: redeem.voucher?.code
            ? redeem.voucher.code
            : redeem['promotion_tier']['id'],
        };
      },
    );

    const usedCoupons: string[] = sentCoupons
      .filter((sendedCoupon) => sendedCoupon.result === 'SUCCESS')
      .map((sendedCoupon) => sendedCoupon.coupon);
    const notUsedCoupons: string[] = sentCoupons
      .filter((sendedCoupon) => sendedCoupon.result !== 'SUCCESS')
      .map((sendedCoupon) => sendedCoupon.coupon);

    this.logger.debug({
      msg: 'Realized coupons',
      id,
      customerId,
      usedCoupons,
      notUsedCoupons,
    });

    const actions = [
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

    return {
      status: true,
      actions: actions,
      redemptionsRedeemStackableResponse: redemptionResponse,
    };
  }

  private async calculateOrederMetadata(
    order: Order,
    orderMetadataSchemaProperties: string[],
    orderPaidActions: OrderPaidActionsInterface,
  ) {
    const isOrderMetadataExisists =
      typeof order?.rawOrder === 'object' &&
      order?.rawOrder !== undefined &&
      orderMetadataSchemaProperties.length > 0;
    if (!isOrderMetadataExisists) {
      return {};
    }

    const simpleMetadata = getSimpleMetadataForOrder(
      order.rawOrder,
      orderMetadataSchemaProperties,
    );

    if (typeof orderPaidActions?.getCustomMetadataForOrder !== 'function') {
      return simpleMetadata;
    }

    const customMetadata = await orderPaidActions.getCustomMetadataForOrder(
      order.rawOrder,
      orderMetadataSchemaProperties,
    );

    if (!Object.keys(customMetadata).length) {
      return {};
    }

    return mergeTwoObjectsIntoOne(customMetadata, simpleMetadata);
  }
}
