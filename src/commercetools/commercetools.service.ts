import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  Cart as CommerceToolsCart,
  LineItem,
  Order,
  Product,
  TaxCategory,
} from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import sleep from '../misc/sleep';
import {
  availablePromotion,
  Cart,
  CartDiscountApplyMode,
  CartResponse,
  Coupon,
  Item,
  PriceSelector,
  ProductToAdd,
  ValidateCouponsResult,
} from '../integration/types';
import { TypesService } from './types/types.service';
import {
  OrdersItem,
  RedemptionsRedeemStackableParams,
  RedemptionsRedeemStackableResponse,
  StackableRedeemableResponse,
  StackableRedeemableResultDiscountUnit,
  ValidationsValidateStackableParams,
} from '@voucherify/sdk';
import { getCommercetoolstCurrentPriceAmount } from './utils/getCommercetoolstCurrentPriceAmount';
import { CUSTOM_FIELD_PREFIX } from '../consts/voucherify';
import { CartAction } from './cartActions/CartAction';
import { ConfigService } from '@nestjs/config';
import { StoreActions } from '../integration/integration.service';
import { TaxCategoriesService } from './tax-categories/tax-categories.service';
import { deleteObjectsFromObject } from '../misc/deleteObjectsFromObject';
import flatten from 'flat';
import { getCouponsFromCart } from '../integration/helperFunctions';
import { getCouponsLimit } from '../voucherify/voucherify.service';
import { getQuantity } from '../integration/mappers/product';
import { ActionBuilder } from './cartActionsBuilder';

interface ProductWithCurrentPriceAmount extends Product {
  currentPriceAmount: number;
  unit: StackableRedeemableResultDiscountUnit;
  item: OrdersItem;
}

export function getSession(cart: CommerceToolsCart): string | undefined {
  return cart.custom?.fields?.session ?? undefined;
}

function getPriceSelectorFromCart(cart: CommerceToolsCart): PriceSelector {
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
    customer: getCustomerFromOrder(order),
  } as RedemptionsRedeemStackableParams;
}

export function buildValidationsValidateStackableParamsForVoucherify(
  coupons: Coupon[],
  cart: Cart,
  items,
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
      ...(cart.sessionKey && { key: cart.sessionKey }),
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

export function mapLineItemsToIntegrationType(lineItems: LineItem[]): Item[] {
  return lineItems
    .filter((item) => getQuantity(item) > 0)
    .map((item) => {
      return {
        source_id: item?.variant?.sku,
        quantity: getQuantity(item),
        price: item.price.value.centAmount,
        amount: item.price.value.centAmount * getQuantity(item),
        name: Object?.values(item.name)?.[0],
        sku: Object?.values(item.name)?.[0],
        attributes: item?.variant.attributes,
      };
    });
}

function translateCtCartToCart(cart: CommerceToolsCart): Cart {
  return {
    id: cart.id,
    customerId: cart?.customerId,
    anonymousId: cart?.anonymousId,
    sessionKey: getSession(cart as CommerceToolsCart),
    coupons: getCouponsFromCart(cart),
    items: mapLineItemsToIntegrationType(cart.lineItems),
  };
}

type handlerCartUpdate = (
  cart: Cart,
  storeActions?: StoreActions,
  helperToGetProductsFromStore?: any,
) => void;

type handlerOrderRedeem = (order: Order) => Promise<{
  actions: { name: string; action: string; value: string[] }[];
  status: boolean;
  redemptionsRedeemStackableResponse?: RedemptionsRedeemStackableResponse;
}>;

@Injectable()
export class CommercetoolsService {
  constructor(
    private readonly logger: Logger,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly typesService: TypesService,
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly configService: ConfigService,
  ) {}
  private handlerCartUpdate: handlerCartUpdate;
  public setCartUpdateListener(handler: handlerCartUpdate) {
    this.handlerCartUpdate = handler;
  }
  private handlerOrderRedeem: handlerOrderRedeem;
  public setOrderRedeemListener(handler: handlerOrderRedeem) {
    this.handlerOrderRedeem = handler;
  }

  async validateCouponsAndPromotionsAndBuildCartActions(
    cart: CommerceToolsCart,
  ): Promise<{
    validateCouponsResult?: ValidateCouponsResult;
    actions: CartAction[];
    status: boolean;
  }> {
    const actionBuilder = new ActionBuilder();
    actionBuilder.setCart(cart);
    actionBuilder.setCouponsLimit(
      getCouponsLimit(
        this.configService.get<number>('COMMERCE_TOOLS_COUPONS_LIMIT'),
      ),
    );

    const cartDiscountApplyMode =
      this.configService.get<string>(
        'APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT',
      ) === 'true'
        ? CartDiscountApplyMode.DirectDiscount
        : CartDiscountApplyMode.CustomLineItem;
    actionBuilder.setCartDiscountApplyMode(cartDiscountApplyMode);

    let taxCategory;
    if (cartDiscountApplyMode === CartDiscountApplyMode.CustomLineItem) {
      taxCategory = await this.getCouponTaxCategory(cart);
    }
    actionBuilder.setTaxCategory(taxCategory);

    if (typeof this.handlerCartUpdate !== 'function') {
      this.logger.error({
        msg: `Error while commercetoolsService.validateCouponsAndPromotionsAndBuildCartActions handlerCartUpdate not configured`,
      });
      return {
        status: false,
        actions: [],
      };
    }
    await this.handlerCartUpdate(
      translateCtCartToCart(cart),
      actionBuilder,
      getPriceSelectorFromCart(cart),
    );

    const actions = actionBuilder.buildActions();

    this.logger.debug({ msg: 'actions', actions });
    return {
      status: true,
      actions: actions,
    };
  }

  async checkIfAPIExtensionRespondedOnTimeAndRevalidateCouponsIfNot(
    cart: CommerceToolsCart,
  ) {
    let cartMutated = false;
    for (let i = 0; i < 2; i++) {
      await sleep(500);
      const updatedCart = await this.commerceToolsConnectorService.findCart(
        cart.id,
      );
      if (updatedCart.version > cart.version) {
        cartMutated = true;
        break;
      }
    }
    if (cartMutated) {
      return;
    }
    if (typeof this.handlerCartUpdate !== 'function') {
      return this.logger.error({
        msg: `Error while commercetoolsService.validateCouponsAndPromotionsAndBuildCartActions handlerCartUpdate not configured`,
      });
    }
    await this.handlerCartUpdate(translateCtCartToCart(cart), null, null);
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
      if (typeof this.handlerOrderRedeem !== 'function') {
        return this.logger.error({
          msg: `Error while commercetoolsService.checkIfCartWasUpdatedWithStatusPaidAndRedeem handlerOrderRedeem not configured`,
        });
      }
      return await this.handlerOrderRedeem(order);
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while redeemVoucherifyCoupons function`,
      });
    }
  }

  public async getCouponTaxCategory(
    cart: CommerceToolsCart,
  ): Promise<TaxCategory> {
    const { country } = cart;
    const taxCategory =
      await this.taxCategoriesService.getCouponTaxCategoryFromResponse();
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
      return await this.taxCategoriesService.getCouponTaxCategoryFromResponse();
    }
    return taxCategory;
  }

  public async getProductsToAdd(
    discountTypeUnit: StackableRedeemableResponse[],
    priceSelector: PriceSelector,
  ): Promise<ProductToAdd[]> {
    const APPLICABLE_PRODUCT_EFFECT = ['ADD_MISSING_ITEMS', 'ADD_NEW_ITEMS'];

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
