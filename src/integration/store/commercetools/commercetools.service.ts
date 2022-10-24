import { Injectable } from '@nestjs/common';
import {
  StoreInterface,
  CartActionsInterface,
  CartUpdateHandler,
  Cart,
} from '../store.interface';
import { Cart as CartCT, Order } from '@commercetools/platform-sdk';
import { CartAction, CartActionSetCustomType } from './cart-actions.dto';

@Injectable()
export class CartActions implements CartActionsInterface {
  private cartActions: CartAction[] = [];
  public setAvailablePromotions: () => Promise<boolean>;
  public setFreeShipping: () => Promise<boolean>;
  public addCoupon: () => Promise<boolean>;
  public getCoupons: () => Promise<boolean>;
  public updateCoupon: () => Promise<boolean>;
  public removeCoupon: () => Promise<boolean>;
  public setCartDiscount: () => Promise<boolean>;
  public getCartActions() {
    return this.cartActions;
  }
}

@Injectable()
export class CommercetoolsService implements StoreInterface {
  private cartUpdateHandler: CartUpdateHandler;
  public onCartUpdate(handler: CartUpdateHandler) {
    this.cartUpdateHandler = handler;
  }
  public async handleApiExtension(cartCt: CartCT): Promise<CartAction[]> {
    if (typeof this.cartUpdateHandler !== 'function') {
      throw new Error('API Extension Handler not configured');
    }
    if (cartCt.version === 1) {
      const couponType = await this.typesService.findCouponType('couponCodes');
      return;
    }
    const cartActions = new CartActions();
    this.cartUpdateHandler(this.mapCtCartToCart(cartCt), cartActions);
    return cartActions.getCartActions();
  }

  private mapCtCartToCart(cartCt: CartCT): Cart {
    return {
      items: cartCt.lineItems.map((lineItem) => ({ id: lineItem.id })),
    };
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
  // onOrderUpdate: (cart: CartActionsInterface) => Promise<boolean>;
  // onCustomerUpdate: (customer) => Promise<boolean>;
}
