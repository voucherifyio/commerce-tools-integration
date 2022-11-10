import { Order } from '@commercetools/platform-sdk';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  RedemptionsRedeemStackableResponse,
  StackableRedeemableResponse,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { uniqBy } from 'lodash';

import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { TypesService } from '../commercetools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import {
  availablePromotion,
  Cart,
  Coupon,
  ProductToAdd,
  SentCoupons,
  ValidateCouponsResult,
} from './types';
import { mapItemsToVoucherifyOrdersItems } from './mappers/product';
import { ConfigService } from '@nestjs/config';
import {
  buildRedeemStackableRequestForVoucherify,
  buildValidationsValidateStackableParamsForVoucherify,
  CommercetoolsService,
  mapLineItemsToIntegrationType,
} from '../commercetools/commercetools.service';
import {
  getCouponsLimit,
  VoucherifyService,
} from '../voucherify/voucherify.service';
import {
  calculateTotalDiscountAmount,
  deserializeCoupons,
  filterCouponsByLimit,
} from './helperFunctions';
import { FREE_SHIPPING_UNIT_TYPE } from '../consts/voucherify';
import { getCouponsByStatus } from '../commercetools/utils/oldGetCouponsByStatus';
import { isClass } from '../misc/isClass';

export interface StoreActions {
  setAvailablePromotions(promotions: availablePromotion[]);
  setProductsToAdd(productsToAdd: ProductToAdd[]);
  setTotalDiscountAmount(totalDiscountAmount: number);
  setApplicableCoupons(applicableCoupons: StackableRedeemableResponse[]);
  setInapplicableCoupons(inapplicableCoupons: StackableRedeemableResponse[]);
  setSkippedCoupons(skippedCoupons: StackableRedeemableResponse[]);
  setIsValid(isValid: boolean);
  setSessionKey(sessionKey: string);
}

@Injectable()
export class IntegrationService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
    private readonly logger: Logger,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly configService: ConfigService,
    private readonly storeService: CommercetoolsService,
    private readonly voucherifyService: VoucherifyService,
  ) {
    this.storeService.setCartUpdateListener(
      (cart, storeActions, helperToGetProductsFromStore) =>
        this.validateCouponsAndGetAvailablePromotions(
          cart,
          storeActions,
          helperToGetProductsFromStore,
        ),
    );
    this.storeService.setOrderRedeemListener((order) =>
      this.redeemVoucherifyCoupons(order),
    );
  }

  public async validateCouponsAndGetAvailablePromotions(
    cart: Cart,
    storeActions?: StoreActions,
    helperToGetProductsFromStore?: any,
  ): Promise<undefined> {
    const { id, customerId, anonymousId, sessionKey, coupons, items } = cart;
    let uniqCoupons: Coupon[] = uniqBy(coupons, 'code');
    if (coupons.length !== uniqCoupons.length) {
      this.logger.debug({
        msg: 'Duplicates found and deleted',
      });
    }

    const { promotions, availablePromotions } =
      await this.voucherifyService.getPromotions(cart, uniqCoupons);

    if (!uniqCoupons.length) {
      this.logger.debug({
        msg: 'No coupons applied, skipping voucherify call',
      });

      if (isClass(storeActions)) {
        storeActions.setAvailablePromotions(availablePromotions);
      }
      return;
    }

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
      this.logger.debug({
        msg: 'Deleting coupons only, skipping voucherify call',
      });

      if (typeof storeActions?.setAvailablePromotions === 'function') {
        storeActions.setAvailablePromotions(availablePromotions);
      }
      return;
    }

    this.logger.debug({
      msg: 'Attempt to apply coupons',
      coupons: uniqCoupons,
      id,
      customerId,
      anonymousId,
    });

    uniqCoupons = filterCouponsByLimit(
      uniqCoupons,
      getCouponsLimit(
        this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT'),
      ),
    );

    let validatedCoupons: ValidationValidateStackableResponse =
      await this.voucherifyConnectorService.validateStackableVouchers(
        buildValidationsValidateStackableParamsForVoucherify(
          uniqCoupons.filter((coupon) => coupon.status != 'DELETED'),
          cart,
          mapItemsToVoucherifyOrdersItems(items),
        ),
      );

    let productsToAdd = [];
    if (isClass(storeActions)) {
      productsToAdd = await this.storeService.getProductsToAdd(
        validatedCoupons.redeemables.filter(
          (redeemable) =>
            redeemable.result?.discount?.type === 'UNIT' &&
            redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE,
        ),
        helperToGetProductsFromStore,
      );
    }

    const productsToAddWithIncorrectPrice = productsToAdd.filter(
      (product) => product.discount_difference,
    );

    if (productsToAddWithIncorrectPrice.length) {
      const itemsWithPricesCorrected = await this.getItemsWithCorrectedPrices(
        validatedCoupons.order.items,
        productsToAddWithIncorrectPrice,
      );
      validatedCoupons =
        await this.voucherifyConnectorService.validateStackableVouchers(
          buildValidationsValidateStackableParamsForVoucherify(
            uniqCoupons.filter((coupon) => coupon.status != 'DELETED'),
            cart,
            itemsWithPricesCorrected,
          ),
        );
    }

    let redeemables = validatedCoupons?.redeemables;
    if (promotions.length) {
      redeemables = this.voucherifyService.setBannerOnValidatedPromotions(
        validatedCoupons,
        promotions,
      );
    }

    this.logger.debug({
      msg: 'Validated coupons',
      validatedCoupons,
      availablePromotions,
      productsToAdd,
    });

    if (isClass(storeActions)) {
      storeActions.setSessionKey(validatedCoupons?.session?.key);
      storeActions.setIsValid(validatedCoupons?.valid ?? false);
      storeActions.setTotalDiscountAmount(
        calculateTotalDiscountAmount(validatedCoupons),
      );
      storeActions.setApplicableCoupons(
        getCouponsByStatus(redeemables, 'APPLICABLE'),
      );
      storeActions.setInapplicableCoupons(
        getCouponsByStatus(redeemables, 'INAPPLICABLE'),
      );
      storeActions.setSkippedCoupons(
        getCouponsByStatus(redeemables, 'SKIPPED'),
      );
      storeActions.setAvailablePromotions(availablePromotions);
      storeActions.setProductsToAdd(productsToAdd);
    }
    return;
  }

  private async getItemsWithCorrectedPrices(
    OrdersItems: OrdersItem[],
    productsToChange: ProductToAdd[],
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
        (productsToChange) =>
          productsToChange.product === (item.sku as any).source_id,
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
      };
    });
  }

  public async redeemVoucherifyCoupons(order: Order) {
    const { id, customerId } = order;

    const orderMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'order',
      );

    const productMetadataSchemaProperties =
      await this.voucherifyConnectorService.getMetadataSchemaProperties(
        'product',
      );
    const orderMetadata = await this.storeService.getMetadataForOrder(
      order,
      orderMetadataSchemaProperties,
    );

    const items = mapItemsToVoucherifyOrdersItems(
      mapLineItemsToIntegrationType(order.lineItems),
      productMetadataSchemaProperties,
    );

    const coupons: Coupon[] = (order.custom?.fields?.discount_codes ?? [])
      .map(deserializeCoupons)
      .filter(
        (coupon) =>
          coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
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

    const sessionKey = order.custom?.fields.session;
    let response: RedemptionsRedeemStackableResponse;
    try {
      response = await this.voucherifyConnectorService.redeemStackableVouchers(
        buildRedeemStackableRequestForVoucherify(
          coupons,
          sessionKey,
          order,
          items,
          orderMetadata,
        ),
      );
    } catch (e) {
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
