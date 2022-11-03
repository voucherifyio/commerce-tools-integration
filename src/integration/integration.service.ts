import { Cart, Order } from '@commercetools/platform-sdk';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  OrdersItem,
  RedemptionsRedeemStackableResponse,
  StackableRedeemableResponseStatus,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { uniqBy } from 'lodash';

import { TaxCategoriesService } from '../commercetools/tax-categories/tax-categories.service';
import { TypesService } from '../commercetools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import {
  Coupon,
  ProductToAdd,
  SentCoupons,
  ValidateCouponsResult,
} from './types';
import { CommercetoolsConnectorService } from '../commercetools/commercetools-connector.service';
import { ProductMapper } from './mappers/product';
import { ConfigService } from '@nestjs/config';
import {
  buildRedeemStackableRequestForVoucherify,
  buildValidationsValidateStackableForVoucherify,
  CommercetoolsService,
} from '../commercetools/commercetools.service';
import { VoucherifyService } from '../voucherify/voucherify.service';
import {
  calculateTotalDiscountAmount,
  checkIfAllInapplicableCouponsArePromotionTier,
  checkIfOnlyNewCouponsFailed,
  deserializeCoupons,
  filterCouponsByLimit,
  getCouponsFromCart,
} from './helperFunctions';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
    private readonly logger: Logger,
    @Inject(forwardRef(() => VoucherifyConnectorService))
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly productMapper: ProductMapper,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => CommercetoolsService))
    private readonly commercetoolsService: CommercetoolsService,
    private readonly voucherifyService: VoucherifyService,
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
      await this.commercetoolsService.checkCouponTaxCategoryIfConfiguredCorrectly(
        cart,
      );

    const couponsLimit =
      (this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT') ?? 5) < 5
        ? this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT')
        : 5;

    const { promotions, availablePromotions } =
      await this.voucherifyService.getPromotions(cart, uniqCoupons);

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

    uniqCoupons = filterCouponsByLimit(uniqCoupons, couponsLimit);

    let validatedCoupons =
      await this.voucherifyConnectorService.validateStackableVouchers(
        buildValidationsValidateStackableForVoucherify(
          uniqCoupons.filter((coupon) => coupon.status != 'DELETED'),
          cart,
          this.productMapper.mapLineItems(cart.lineItems),
          sessionKey,
        ),
      );

    const productsToAdd = await this.commercetoolsService.getProductsToAdd(
      validatedCoupons,
      this.commercetoolsService.getPriceSelectorFromCart(cart),
    );

    const productsToChange = productsToAdd.filter(
      (product) => product.discount_difference,
    );

    if (productsToChange.length) {
      const items = await this.getItemsWithCorrectedPrices(
        validatedCoupons,
        productsToChange,
      );
      validatedCoupons =
        await this.voucherifyConnectorService.validateStackableVouchers(
          buildValidationsValidateStackableForVoucherify(
            uniqCoupons.filter((coupon) => coupon.status != 'DELETED'),
            cart,
            items,
            sessionKey,
          ),
        );
    }

    if (promotions.length) {
      this.voucherifyService.setBannerOnValidatedPromotions(
        validatedCoupons,
        promotions,
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
      couponsLimit,
    };
  }

  private async getItemsWithCorrectedPrices(
    validatedCoupons: ValidationValidateStackableResponse,
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
    return validatedCoupons.order.items.map((item: OrdersItem) => {
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
    const orderMetadata = await this.commercetoolsService.getMetadataForOrder(
      order,
      orderMetadataSchemaProperties,
    );

    const items = this.productMapper.mapLineItems(
      order.lineItems,
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
