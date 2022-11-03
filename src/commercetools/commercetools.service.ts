import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cart, LineItem, Order, Product } from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import sleep from '../misc/sleep';
import {
  CartDiscountApplyMode,
  CartResponse,
  Coupon,
  PriceSelector,
  ProductToAdd,
  ValidateCouponsResult,
} from '../integration/types';
import { TypesService } from './types/types.service';
import {
  OrdersItem,
  RedemptionsRedeemStackableParams,
  StackableRedeemableResultDiscountUnit,
  ValidationsValidateStackableParams,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { getCommercetoolstCurrentPriceAmount } from './utils/getCommercetoolstCurrentPriceAmount';
import {
  CUSTOM_FIELD_PREFIX,
  FREE_SHIPPING_UNIT_TYPE,
} from '../consts/voucherify';
import { CartAction } from './cartActions/CartAction';
import getCartActionBuilders from './cartActions/getCartActionBuilders';
import { ConfigService } from '@nestjs/config';
import { IntegrationService } from '../integration/integration.service';
import { TaxCategoriesService } from './tax-categories/tax-categories.service';
import { deleteObjectsFromObject } from '../misc/deleteObjectsFromObject';
import flatten from 'flat';

interface ProductWithCurrentPriceAmount extends Product {
  currentPriceAmount: number;
  unit: StackableRedeemableResultDiscountUnit;
  item: OrdersItem;
}

function getSession(cart: Cart): string | null {
  return cart.custom?.fields?.session ?? null;
}

export function checkIfItemsQuantityIsEqualOrHigherThanItemTotalQuantityDiscount(
  lineItems: LineItem[],
): boolean {
  return !!lineItems?.find((lineItem) => {
    if (!lineItem.custom?.fields?.applied_codes?.length) {
      return false;
    }
    const { quantity: itemQuantity } = lineItem;
    const totalQuantityDiscount = lineItem.custom?.fields?.applied_codes
      .map((code) => JSON.parse(code))
      .filter((code) => code.type === 'UNIT')
      .reduce((sum, codeObject) => {
        if (codeObject.quantity) {
          sum += codeObject.quantity;
        }
        return sum;
      }, 0);
    return totalQuantityDiscount > itemQuantity;
  });
}

export function getCustomerFromOrder(order: Order) {
  return {
    source_id: order.customerId || order.anonymousId,
    name: `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`,
    email: order.shippingAddress?.email,
    address: {
      city: order.shippingAddress?.city,
      country: order.shippingAddress?.country,
      postal_code: order.shippingAddress?.postalCode,
      line_1: order.shippingAddress?.streetName,
    },
    phone: order.shippingAddress?.phone,
  };
}

export function buildRedeemStackableRequestForVoucherify(
  coupons: Coupon[],
  sessionKey: string,
  order: Order,
  items: OrdersItem[],
  orderMetadata: Record<string, any>,
): RedemptionsRedeemStackableParams {
  return {
    session: {
      type: 'LOCK',
      key: sessionKey,
    },
    redeemables: coupons.map((code) => {
      return {
        object: code.type ? code.type : 'voucher',
        id: code.code,
      };
    }),
    order: {
      source_id: order.id,
      amount: items.reduce((acc, item) => acc + item.amount, 0),
      status: 'PAID',
      items,
      metadata: orderMetadata,
    },
    customer: this.getCustomerFromOrder(order),
  } as RedemptionsRedeemStackableParams;
}

export function buildValidationsValidateStackableForVoucherify(
  coupons: Coupon[],
  cart: Cart,
  items,
  sessionKey?: string | null,
) {
  return {
    // options?: StackableOptions;
    redeemables: coupons.map((code) => {
      return {
        object: code.type ? code.type : 'voucher',
        id: code.code,
      };
    }),
    session: {
      type: 'LOCK',
      ...(sessionKey && { key: sessionKey }),
    },
    order: {
      source_id: cart.id,
      customer: {
        source_id: cart.customerId || cart.anonymousId,
      },
      amount: items.reduce((acc, item) => acc + item.amount, 0),
      discount_amount: 0,
      items,
    },
    customer: {
      source_id: cart.customerId || cart.anonymousId,
    },
  } as ValidationsValidateStackableParams;
}

@Injectable()
export class CommercetoolsService {
  constructor(
    private readonly logger: Logger,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly typesService: TypesService,
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly configService: ConfigService,
    private readonly integrationService: IntegrationService,
  ) {}

  async checkCouponTaxCategoryWithCountries(cart: Cart) {
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

  public async getProductsToAdd(
    response: ValidationValidateStackableResponse,
    priceSelector: PriceSelector,
  ): Promise<ProductToAdd[]> {
    const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

    const discountTypeUnit = response.redeemables.filter(
      (redeemable) =>
        redeemable.result?.discount?.type === 'UNIT' &&
        redeemable.result.discount.unit_type !== FREE_SHIPPING_UNIT_TYPE,
    );

    const freeProductsToAdd = discountTypeUnit.flatMap(
      async (unitTypeRedeemable) => {
        const discount = unitTypeRedeemable.result?.discount;
        if (!discount) {
          return [];
        }
        const freeUnits = (
          discount.units
            ? discount.units
            : [{ ...discount } as StackableRedeemableResultDiscountUnit]
        ).filter((unit) => APPLICABLE_PRODUCT_EFFECT.includes(unit.effect));
        if (!freeUnits.length) {
          return [];
        }
        const productsToAdd = (
          await this.getCtProductsWithCurrentPriceAmount(
            priceSelector,
            freeUnits,
            unitTypeRedeemable.order.items,
          )
        ).map((productToAdd) => {
          return {
            code: unitTypeRedeemable.id,
            effect: productToAdd.unit.effect,
            quantity: productToAdd.unit.unit_off,
            product: productToAdd.unit.sku.source_id,
            initial_quantity: productToAdd.item.initial_quantity,
            discount_quantity: productToAdd.item.discount_quantity,
            discount_difference:
              productToAdd.item?.applied_discount_amount -
                productToAdd.currentPriceAmount *
                  productToAdd.item?.discount_quantity !==
              0,
            applied_discount_amount: productToAdd.currentPriceAmount,
            distributionChannel: priceSelector.distributionChannels[0],
          } as ProductToAdd;
        });

        return Promise.all(productsToAdd);
      },
    );

    return Promise.all(freeProductsToAdd).then((response) => {
      return response.flatMap((element) => {
        return element;
      });
    });
  }

  public async getCtProductsWithCurrentPriceAmount(
    priceSelector: PriceSelector,
    freeUnits: StackableRedeemableResultDiscountUnit[],
    orderItems: OrdersItem[],
  ): Promise<ProductWithCurrentPriceAmount[]> {
    const productSourceIds = freeUnits.map((unit) => {
      return unit.product.source_id;
    });
    const ctProducts = await this.commerceToolsConnectorService.getCtProducts(
      priceSelector,
      productSourceIds,
    );

    return ctProducts.map((ctProduct) => {
      const unit = freeUnits.find(
        (unit) => unit.product.source_id === ctProduct.id,
      );
      const currentPriceAmount = getCommercetoolstCurrentPriceAmount(
        ctProduct,
        unit.sku.source_id,
        priceSelector,
      );
      const item = orderItems?.find(
        (item) => item?.sku?.source_id === unit.sku.source_id,
      ) as OrdersItem;
      return { ...ctProduct, currentPriceAmount, unit, item };
    });
  }

  public async setCustomTypeForInitializedCart(): Promise<CartResponse> {
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
    const validateCouponsResult = await this.integrationService.validateCoupons(
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

  async checkIfAPIExtensionRespondedOnTimeAndRevalidateCouponsIfNot(
    cart: Cart,
  ) {
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
    await this.integrationService.validateCoupons(cart, getSession(cart));
    return this.logger.debug('Coupons changes were rolled back successfully');
  }

  public async checkIfCartWasUpdatedWithStatusPaidAndRedeem(
    orderFromRequest: Order,
  ) {
    if (orderFromRequest.paymentState !== 'Paid') {
      return this.logger.debug({
        msg: 'Order is not paid',
        id: orderFromRequest.id,
        customerId: orderFromRequest.customerId,
      });
    }
    await sleep(650);
    const order = await this.commerceToolsConnectorService.findOrder(
      orderFromRequest.id,
    );
    if (
      order.version <= orderFromRequest.version ||
      order.paymentState !== 'Paid'
    ) {
      return this.logger.debug({
        msg: `Order was not modified, payment state: ${order.paymentState}`,
        id: orderFromRequest.id,
        customerId: orderFromRequest.customerId,
      });
    }
    try {
      return await this.integrationService.redeemVoucherifyCoupons(order);
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while redeemVoucherifyCoupons function`,
      });
    }
  }

  public getPriceSelectorFromCart(cart: Cart): PriceSelector {
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

  public async getMetadataForOrder(
    order: Order,
    allMetadataSchemaProperties: string[],
  ) {
    const standardMetaProperties = allMetadataSchemaProperties.filter(
      (key) => !key.includes(CUSTOM_FIELD_PREFIX),
    );
    const customMetaProperties = allMetadataSchemaProperties.filter(
      (key) =>
        key.length > CUSTOM_FIELD_PREFIX.length &&
        key.slice(0, CUSTOM_FIELD_PREFIX.length) === CUSTOM_FIELD_PREFIX,
    );

    const metadata = {};

    const addToMataData = (variable: any, name: string) => {
      if (typeof variable !== 'object') {
        return (metadata[name] = variable);
      }
      if (Array.isArray(variable)) {
        const newArray = [];
        variable.forEach((element) => {
          if (typeof variable !== 'object') {
            newArray.push(element);
          }
          if (!Array.isArray(variable)) {
            newArray.push(deleteObjectsFromObject(flatten(element)));
          }
        });
        return (metadata[name] = newArray);
      }
      if (typeof variable === 'object') {
        return (metadata[name] = deleteObjectsFromObject(flatten(variable)));
      }
      return;
    };

    standardMetaProperties.forEach((key) => {
      if (order[key]) {
        addToMataData(order[key], key);
      }
    });

    if (order?.custom?.fields && customMetaProperties.length) {
      customMetaProperties.forEach((key) => {
        if (order.custom.fields?.[key.slice(CUSTOM_FIELD_PREFIX.length)]) {
          addToMataData(
            order.custom.fields[key.slice(CUSTOM_FIELD_PREFIX.length)],
            key,
          );
        }
      });
    }

    if (standardMetaProperties.find((key) => key === 'payments')) {
      const payments = [];
      const paymentReferences = order?.paymentInfo?.payments ?? [];
      for await (const paymentReference of paymentReferences) {
        payments.push(
          await this.commerceToolsConnectorService.findPayment(
            paymentReference.id,
          ),
        );
      }
      metadata['payments'] = payments
        .filter((payment) => payment?.id)
        .map((payment) => deleteObjectsFromObject(flatten(payment)));
    }

    return metadata;
  }
}
