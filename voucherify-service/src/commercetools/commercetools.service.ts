import { Injectable, Logger } from '@nestjs/common';
import {
  Cart as CommerceToolsCart,
  Order as CommerceToolsOrder,
  Type,
} from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import sleep from '../misc/sleep';
import {
  CartUpdateHandler,
  OrderRedeemHandler,
  StoreInterface,
} from '../integration/types';
import { CustomTypesService } from './custom-types/custom-types.service';
import { CartAction } from './store-actions/cart-update-actions/CartAction';
import { ConfigService } from '@nestjs/config';
import { TaxCategoriesService } from './tax-categories/tax-categories.service';
import { CartUpdateActions } from './store-actions/cart-update-actions';
import { translateCtCartToCart } from './utils/mappers/translateCtCartToCart';
import { getPriceSelectorFromCtCart } from './utils/mappers/getPriceSelectorFromCtCart';
import { translateCtOrderToOrder } from './utils/mappers/translateCtOrderToOrder';
import { CartDiscountApplyMode, CartResponse } from './types';
import { OrderPaidActions } from './store-actions/order-paid-actions';

@Injectable()
export class CommercetoolsService implements StoreInterface {
  constructor(
    private readonly logger: Logger,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly typesService: CustomTypesService,
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly configService: ConfigService,
  ) {}

  private cartUpdateHandler: CartUpdateHandler;

  public setCartUpdateListener(handler: CartUpdateHandler) {
    this.cartUpdateHandler = handler;
  }

  private orderPaidHandler: OrderRedeemHandler;

  public setOrderPaidListener(handler: OrderRedeemHandler) {
    this.orderPaidHandler = handler;
  }

  private cartDiscountApplyMode: CartDiscountApplyMode =
    this.configService.get<string>(
      'APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT',
    ) === 'true'
      ? CartDiscountApplyMode.DirectDiscount
      : CartDiscountApplyMode.CustomLineItem;

  private maxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut: number =
    this.configService.get<number>(
      'MAX_CART_UPDATE_RESPONSE_TIME_WITHOUT_CHECKING_IF_API_EXTENSION_TIMED_OUT',
    );

  async handleCartUpdate(cart: CommerceToolsCart): Promise<{
    actions: CartAction[];
    status: boolean;
  }> {
    if (cart.version === 1) {
      return await this.setCustomTypeForInitializedCart();
    }

    const cartUpdateActions = new CartUpdateActions();

    if (cart.custom?.type?.id !== (await this.getCouponCodesType()).id) {
      cartUpdateActions.setInitialActions([
        await this.getSetCustomTypeAction(),
      ]);
    }
    cartUpdateActions.setPriceSelector(getPriceSelectorFromCtCart(cart));
    cartUpdateActions.setCtClient(
      this.commerceToolsConnectorService.getClient(),
    );
    cartUpdateActions.setCart(cart);
    cartUpdateActions.setCartDiscountApplyMode(this.cartDiscountApplyMode);

    if (this.cartDiscountApplyMode === CartDiscountApplyMode.CustomLineItem) {
      cartUpdateActions.setTaxCategory(
        await this.taxCategoriesService.getCouponTaxCategoryAndUpdateItIfNeeded(
          cart?.country,
        ),
      );
    }

    if (typeof this.cartUpdateHandler !== 'function') {
      this.logger.error({
        msg: `Error while commercetoolsService.validateCouponsAndPromotionsAndBuildCartActions CartUpdateHandler not configured`,
      });
      return {
        status: false,
        actions: [],
      };
    }
    await this.cartUpdateHandler(
      translateCtCartToCart(cart),
      cartUpdateActions,
    );

    const actions = cartUpdateActions.buildActions();

    this.logger.debug({ msg: 'actions', actions });
    return {
      status: true,
      actions: actions,
    };
  }

  async handleAPIExtensionTimeoutOnCartUpdate(
    cart: CommerceToolsCart,
    buildingResponseTime: number,
  ) {
    if (!cart?.custom?.fields?.discount_codes?.length) {
      return;
    }
    if (
      buildingResponseTime <
      this.maxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut
    ) {
      return;
    }
    for (let i = 0; i < 2; i++) {
      await sleep(500);
      const updatedCart = await this.commerceToolsConnectorService.findCart(
        cart.id,
      );
      if (updatedCart.version > cart.version) {
        return;
      }
    }
    if (typeof this.cartUpdateHandler !== 'function') {
      this.logger.error({
        msg: `Error while commercetoolsService.validateCouponsAndPromotionsAndBuildCartActions CartUpdateHandler not configured`,
      });
      return;
    }
    //dropping sessions from coupons that are not included in cart (because of API extension timeout)
    await this.cartUpdateHandler(translateCtCartToCart(cart));
    this.logger.debug('Coupons changes were rolled back successfully');
  }

  public async checkIfCartStatusIsPaidAndRedeem(
    order: CommerceToolsOrder,
  ): Promise<void> {
    if (order.paymentState !== 'Paid') {
      this.logger.debug({
        msg: 'Order is not paid',
        id: order.id,
        customerId: order.customerId,
      });
      return;
    }
    try {
      if (typeof this.orderPaidHandler !== 'function') {
        this.logger.error({
          msg: `Error while commercetoolsService.checkIfCartWasUpdatedWithStatusPaidAndRedeem OrderRedeemHandler not configured`,
        });
        return;
      }
      const orderPaidActions = new OrderPaidActions();
      orderPaidActions.setCtClient(
        this.commerceToolsConnectorService.getClient(),
      );
      await this.orderPaidHandler(
        translateCtOrderToOrder(order),
        orderPaidActions,
      );
      return;
    } catch (e) {
      console.log(e); //can't use the logger because it cannot handle error objects
      this.logger.error({
        msg: `Error while redeemVoucherifyCoupons function`,
      });
      return;
    }
  }

  private async getCouponCodesType(): Promise<Type> {
    return await this.typesService.findCouponType('couponCodes');
  }

  private async getSetCustomTypeAction(): Promise<CartAction> {
    const couponType = await this.typesService.findCouponType('couponCodes');
    return {
      action: 'setCustomType',
      type: {
        id: couponType.id,
      },
      name: 'couponCodes',
    };
  }

  public async setCustomTypeForInitializedCart(): Promise<CartResponse> {
    return {
      status: true,
      actions: [await this.getSetCustomTypeAction()],
    };
  }
}
