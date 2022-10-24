import { Injectable, Logger } from '@nestjs/common';
import {
  StoreInterface,
  CartActionsInterface,
  CartUpdateHandler,
  Cart,
  Coupon,
} from '../store.interface';
import {
  Cart as CartCT,
  Order as OrderCT,
  TaxCategory,
} from '@commercetools/platform-sdk';
import {
  CartAction,
  CartActionSetCustomType,
  CartActionAddCustomLineItem,
  CartActionRemoveCustomLineItem,
} from './cart-actions.dto';
import { TypesService } from './types.service';
import { TaxCategoriesService } from './tax-categories.service';
import { ProductMapper } from './product';
import { uniqBy } from 'lodash';
export const COUPON_CUSTOM_LINE_SLUG = 'Voucher, ';

@Injectable()
export class CartActions implements CartActionsInterface {
  constructor(private taxCategory: TaxCategory, private cart: CartCT) {}
  private cartActions: CartAction[] = [];
  public setAvailablePromotions: () => Promise<boolean>;
  public setFreeShipping: () => Promise<boolean>;
  public addCoupon: () => Promise<boolean>;
  public getCoupons: () => Promise<boolean>;
  public updateCoupon: () => Promise<boolean>;
  public removeCoupon: () => Promise<boolean>;
  public async setCartDiscount(amount: number) {
    // todo direct discount

    if (!amount) {
      return true;
    }

    const removeOldCustomLineItems = (this.cart.customLineItems || [])
      .filter((lineItem) => lineItem.slug.startsWith(COUPON_CUSTOM_LINE_SLUG))
      .map(
        (lineItem) =>
          ({
            action: 'removeCustomLineItem',
            customLineItemId: lineItem.id,
          } as CartActionRemoveCustomLineItem),
      );

    const newCustomLineItem: CartActionAddCustomLineItem = {
      action: 'addCustomLineItem',
      name: {
        en: 'Coupon codes discount',
        de: 'Gutscheincodes rabatt',
      }, // todo config
      quantity: 1,
      money: {
        centAmount: amount ? -amount : 0,
        type: 'centPrecision',
        fractionDigits: this.cart.totalPrice.fractionDigits,
        currencyCode: this.cart.totalPrice.currencyCode,
      },
      slug: COUPON_CUSTOM_LINE_SLUG,
      taxCategory: {
        id: this.taxCategory.id,
      },
    };

    this.cartActions.push(...removeOldCustomLineItems, newCustomLineItem);
    return true;
  }

  public getCartActions() {
    return this.cartActions;
  }
}

@Injectable()
export class CommercetoolsService implements StoreInterface {
  constructor(
    private readonly typesService: TypesService,
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly logger: Logger,
    private readonly productMapper: ProductMapper,
  ) {}
  private cartUpdateHandler: CartUpdateHandler;
  public onCartUpdate(handler: CartUpdateHandler) {
    this.cartUpdateHandler = handler;
  }

  public async handleApiExtension(cartCt: CartCT): Promise<CartAction[]> {
    if (typeof this.cartUpdateHandler !== 'function') {
      throw new Error('API Extension Handler not configured');
    }
    if (cartCt.version === 1) {
      return await this.setCustomTypeForInitializedCart();
    }

    const taxCategory = await this.checkCouponTaxCategoryWithCountries(cartCt);

    const cartActions = new CartActions(taxCategory, cartCt);

    await this.cartUpdateHandler(this.mapCtCartToCart(cartCt), cartActions);

    return cartActions.getCartActions();
  }

  private desarializeCoupons(serializedDiscountOrCode: string): Coupon {
    if (serializedDiscountOrCode.startsWith('{')) {
      return JSON.parse(serializedDiscountOrCode);
    }
    // that case handle legacy way of saving coupons in Commerce Tools
    return {
      code: serializedDiscountOrCode,
      status: 'NEW',
    };
  }

  private mapCtCartToCart(cartCt: CartCT): Cart {
    return {
      items: this.productMapper.mapLineItems(cartCt.lineItems),
      session: cartCt.custom?.fields?.session ?? null,
      coupons: uniqBy(
        (cartCt.custom?.fields?.discount_codes ?? [])
          .map(this.desarializeCoupons)
          .filter(
            (coupon) =>
              coupon.status !== 'NOT_APPLIED' && coupon.status !== 'AVAILABLE',
          ),
        'code',
      ),
      metadata: {
        id: cartCt.id,
        customerId: cartCt.customerId,
        anonymousId: cartCt.anonymousId,
      },
    };
  }

  private async checkCouponTaxCategoryWithCountries(cart: CartCT) {
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

  private async setCustomTypeForInitializedCart(): Promise<CartAction[]> {
    const couponType = await this.typesService.findCouponType('couponCodes');
    if (!couponType) {
      const msg = 'CouponType not found';
      this.logger.error({ msg });
      throw new Error(msg);
    }

    return [
      {
        action: 'setCustomType',
        type: {
          id: couponType.id,
        },
        name: 'couponCodes',
      },
    ];
  }

  private getCustomerFromOrder(order: OrderCT) {
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

  // onOrderUpdate: (cart: CartActionsInterface) => Promise<boolean>;
  // onCustomerUpdate: (customer) => Promise<boolean>;
}
