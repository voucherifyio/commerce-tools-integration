import { Injectable, Logger } from '@nestjs/common';
import {
  Cart as CommerceToolsCart,
  Order as CommerceToolsOrder,
  TaxCategory,
} from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import sleep from '../misc/sleep';
import { Cart, Order } from '../integration/types';
import { CustomTypesService } from './custom-types/custom-types.service';
import { RedemptionsRedeemStackableResponse } from '@voucherify/sdk';
import { CUSTOM_FIELD_PREFIX } from '../consts/voucherify';
import { CartAction } from './store-actions/cart-update-actions/CartAction';
import { ConfigService } from '@nestjs/config';
import { TaxCategoriesService } from './tax-categories/tax-categories.service';
import { deleteObjectsFromObject } from './utils/deleteObjectsFromObject';
import flatten from 'flat';
import { getCouponsLimit } from '../voucherify/voucherify.service';
import { CartUpdateActions } from './store-actions/cart-update-actions';
import { getMaxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut } from './utils/getMaxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut';
import { translateCtCartToCart } from './utils/mappers/translateCtCartToCart';
import { getPriceSelectorFromCtCart } from './utils/mappers/getPriceSelectorFromCtCart';
import { translateCtOrderToOrder } from './utils/mappers/translateCtOrderToOrder';
import { CartDiscountApplyMode, CartResponse } from './types';
import { OrderPaidActions } from './store-actions/order-paid-actions';

type CartUpdateHandler = (cart: Cart, storeActions?: CartUpdateActions) => void;

type OrderRedeemHandler = (
  order: Order,
  storeActions?: OrderPaidActions,
) => Promise<{
  actions: { name: string; action: string; value: string[] }[];
  status: boolean;
  redemptionsRedeemStackableResponse?: RedemptionsRedeemStackableResponse;
}>;

@Injectable()
export class CommercetoolsService {
  constructor(
    private readonly logger: Logger,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly typesService: CustomTypesService,
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly configService: ConfigService,
  ) {}
  private CartUpdateHandler: CartUpdateHandler;
  public setCartUpdateListener(handler: CartUpdateHandler) {
    this.CartUpdateHandler = handler;
  }
  private OrderPaidHandler: OrderRedeemHandler;
  public setOrderPaidListener(handler: OrderRedeemHandler) {
    this.OrderPaidHandler = handler;
  }

  private maxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut: number =
    getMaxCartUpdateResponseTimeWithoutCheckingIfApiExtensionTimedOut(
      this.configService.get<number>(
        'MAX_CART_UPDATE_RESPONSE_TIME_WITHOUT_CHECKING_IF_API_EXTENSION_TIMED_OUT',
      ),
    );

  async handleCartUpdate(cart: CommerceToolsCart): Promise<{
    actions: CartAction[];
    status: boolean;
  }> {
    if (cart.version === 1) {
      return await this.setCustomTypeForInitializedCart();
    }

    const cartUpdateActions = new CartUpdateActions();
    cartUpdateActions.setPriceSelector(getPriceSelectorFromCtCart(cart));
    cartUpdateActions.setCtClient(
      this.commerceToolsConnectorService.getClient(),
    );
    cartUpdateActions.setCart(cart);
    cartUpdateActions.setCouponsLimit(
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
    cartUpdateActions.setCartDiscountApplyMode(cartDiscountApplyMode);

    let taxCategory;
    if (cartDiscountApplyMode === CartDiscountApplyMode.CustomLineItem) {
      taxCategory = await this.getCouponTaxCategory(cart);
    }
    cartUpdateActions.setTaxCategory(taxCategory);

    if (typeof this.CartUpdateHandler !== 'function') {
      this.logger.error({
        msg: `Error while commercetoolsService.validateCouponsAndPromotionsAndBuildCartActions CartUpdateHandler not configured`,
      });
      return {
        status: false,
        actions: [],
      };
    }
    await this.CartUpdateHandler(
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

  async handleAPIExtensionTimeout(
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
    if (typeof this.CartUpdateHandler !== 'function') {
      return this.logger.error({
        msg: `Error while commercetoolsService.validateCouponsAndPromotionsAndBuildCartActions CartUpdateHandler not configured`,
      });
    }
    await this.CartUpdateHandler(translateCtCartToCart(cart)); //dropping sessions from coupons that are not included in cart (because of API extension timeout)
    return this.logger.debug('Coupons changes were rolled back successfully');
  }

  public async checkIfCartStatusIsPaidAndRedeem(order: CommerceToolsOrder) {
    if (order.paymentState !== 'Paid') {
      return this.logger.debug({
        msg: 'Order is not paid',
        id: order.id,
        customerId: order.customerId,
      });
    }
    try {
      if (typeof this.OrderPaidHandler !== 'function') {
        return this.logger.error({
          msg: `Error while commercetoolsService.checkIfCartWasUpdatedWithStatusPaidAndRedeem OrderRedeemHandler not configured`,
        });
      }
      const orderPaidActions = new OrderPaidActions();
      orderPaidActions.setCtClient(
        this.commerceToolsConnectorService.getClient(),
      );
      await this.OrderPaidHandler(
        translateCtOrderToOrder(order),
        orderPaidActions,
      );
      return;
    } catch (e) {
      console.log(e); //can't use the logger because it cannot handle error objects
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
}
