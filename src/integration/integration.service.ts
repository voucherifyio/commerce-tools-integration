import { Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
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
} from './types';
import { mapItemsToVoucherifyOrdersItems } from './utils/mappers/product';
import { ConfigService } from '@nestjs/config';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { VoucherifyService } from '../voucherify/voucherify.service';
import { calculateTotalDiscountAmount } from './utils/helperFunctions';
import { FREE_SHIPPING_UNIT_TYPE } from '../consts/voucherify';
import {
  codesFromRedeemables,
  filterOutRedeemablesIfCodeIn,
  getRedeemablesByStatus,
  getUnitTypeRedeemablesFromStackableResponse,
} from './utils/redeemableOperationFunctions';
import { buildValidationsValidateStackableParamsForVoucherify } from './utils/mappers/buildValidationsValidateStackableParamsForVoucherify';
import { buildRedeemStackableRequestForVoucherify } from './utils/mappers/buildRedeemStackableRequestForVoucherify';
import { getSimpleMetadataForOrder } from '../commercetools/utils/mappers/getSimpleMetadataForOrder';
import { mergeTwoObjectsIntoOne } from './utils/mergeTwoObjectsIntoOne';
import { getProductsFromRedeemables } from './utils/mappers/getProductsFromRedeemables';
import { getMissingProductsToAdd } from './utils/mappers/getMissingProductsToAdd';
import { replaceCodesWithInapplicableCoupons } from './utils/replaceCodesWithInapplicableCoupons';
import {
  couponsStatusDeleted,
  filterOutCouponsTypePromotionTier,
  filterCouponsStatusAppliedAndNewByLimit,
  filterOutCouponsStatusNotApplied,
  codesFromCoupons,
  uniqueCouponsByCodes,
  filterOutCouponsIfCodeIn,
} from './utils/couponsOperationFunctions';

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
    const inapplicableCodes = codesFromRedeemables(inapplicableRedeemables);

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
      getUnitTypeRedeemablesFromStackableResponse(validatedCoupons);

    let productsToAdd: ProductToAdd[] = [];
    if (typeof cartUpdateActions.getProductsToAdd === 'function') {
      productsToAdd = await cartUpdateActions.getProductsToAdd(
        unitTypeRedeemables,
      );
    }

    const productsFromRedeemables =
      getProductsFromRedeemables(unitTypeRedeemables);
    const missingProductsToAdd = getMissingProductsToAdd(
      productsFromRedeemables,
      productsToAdd,
    );

    const codesWithMissingProductsToAdd = [
      ...new Set(
        missingProductsToAdd.map(
          (missingProductToAdd) => missingProductToAdd.code,
        ),
      ),
    ];

    //don't wait
    this.voucherifyConnectorService.releaseValidationSession(
      codesWithMissingProductsToAdd,
      validatedCoupons?.session?.key ?? sessionKey,
    );

    const productsToAddWithIncorrectPrice = productsToAdd.filter(
      (product) => product.discount_difference,
    );

    if (
      filterOutCouponsIfCodeIn(
        couponsAppliedAndNewLimitedByConfig,
        codesWithMissingProductsToAdd,
      ).length > 0 &&
      productsToAddWithIncorrectPrice.length
    ) {
      const itemsWithPricesCorrected = await this.getItemsWithCorrectedPrices(
        validatedCoupons.order.items,
        productsToAddWithIncorrectPrice,
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

    this.logger.debug({
      msg: 'Validated coupons',
      validatedCoupons,
      availablePromotions,
      productsToAdd,
    });

    if (
      typeof cartUpdateActions.setSessionKey === 'function' &&
      typeof cartUpdateActions.setTotalDiscountAmount === 'function' &&
      typeof cartUpdateActions.setApplicableCoupons === 'function' &&
      typeof cartUpdateActions.setInapplicableCoupons === 'function' &&
      typeof cartUpdateActions.setProductsToAdd === 'function'
    ) {
      cartUpdateActions.setSessionKey(validatedCoupons?.session?.key);
      cartUpdateActions.setTotalDiscountAmount(
        calculateTotalDiscountAmount(validatedCoupons),
      );
      cartUpdateActions.setApplicableCoupons(
        this.voucherifyService.setBannerOnValidatedPromotions(
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
    return;
  }

  private async getItemsWithCorrectedPrices(
    OrdersItems: OrdersItem[],
    productsToChange: ProductToAdd[],
  ): Promise<OrdersItem[]> {
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
    return OrdersItems.filter(
      (item) => item.product_id !== FREE_SHIPPING_UNIT_TYPE,
    ).map((item: OrdersItem) => {
      if (
        !productsToChangeSKUs.includes((item.sku as OrderItemSku).source_id) ||
        item.amount !== item.discount_amount
      ) {
        return {
          ...item,
          initial_quantity:
            item?.initial_quantity > 0 ? item.initial_quantity : undefined,
        };
      }
      const currentProductToChange = productsToChange.find(
        (productsToChange) => productsToChange.product === item.sku.source_id,
      );
      return {
        object: item?.object,
        product_id: item?.product_id,
        sku_id: item?.sku_id,
        initial_quantity:
          item?.initial_quantity > 0 ? item.initial_quantity : undefined,
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
      } as OrdersItem;
    });
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

    let orderMetadata = {};

    if (
      typeof order?.rawOrder === 'object' &&
      order?.rawOrder !== undefined &&
      orderMetadataSchemaProperties.length > 0
    ) {
      const simpleMetadata = getSimpleMetadataForOrder(
        order.rawOrder,
        orderMetadataSchemaProperties,
      );
      if (typeof orderPaidActions?.getCustomMetadataForOrder !== 'function') {
        orderMetadata = simpleMetadata;
      } else {
        const customMetadata = await orderPaidActions.getCustomMetadataForOrder(
          order.rawOrder,
          orderMetadataSchemaProperties,
        );
        if (Object.keys(customMetadata).length > 0) {
          orderMetadata = mergeTwoObjectsIntoOne(
            customMetadata,
            simpleMetadata,
          );
        }
      }
    }

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
    const sentCoupons: SentCoupons[] = [];
    const usedCoupons: string[] = [];
    const notUsedCoupons: string[] = [];
    let response: RedemptionsRedeemStackableResponse;
    try {
      response = await this.voucherifyConnectorService.redeemStackableVouchers(
        buildRedeemStackableRequestForVoucherify(order, items, orderMetadata),
      );
    } catch (e) {
      console.log(e); //can't use the logger because it cannot handle error objects
      this.logger.debug({ msg: 'Redeem operation failed', error: e.details });
      return { status: true, actions: [] };
    }

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

    this.logger.debug({
      msg: 'Voucherify redeem response',
      id,
      customerId,
      redemptions: response?.redemptions,
    });

    sentCoupons.forEach((sendedCoupon) => {
      if (sendedCoupon.result === 'SUCCESS') {
        usedCoupons.push(sendedCoupon.coupon);
      } else {
        notUsedCoupons.push(sendedCoupon.coupon);
      }
    });

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
      redemptionsRedeemStackableResponse: response,
    };
  }
}
