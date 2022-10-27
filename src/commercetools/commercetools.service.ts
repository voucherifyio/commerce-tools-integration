import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../integration/order.service';
import { Cart, Order, Product } from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import sleep from '../integration/utils/sleep';
import {
  CartResponse,
  PriceSelector,
  ProductToAdd,
} from '../integration/types';
import { TypesService } from './types/types.service';
import {
  OrdersItem,
  StackableRedeemableResultDiscountUnit,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { getCommercetoolstCurrentPriceAmount } from './utils/getCommercetoolstCurrentPriceAmount';
import { FREE_SHIPPING_UNIT_TYPE } from '../consts/voucherify';

interface ProductWithCurrentPriceAmount extends Product {
  currentPriceAmount: number;
  unit: StackableRedeemableResultDiscountUnit;
  item: OrdersItem;
}

@Injectable()
export class CommercetoolsService {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: Logger,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly typesService: TypesService,
  ) {}

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
        (item) => item.sku.source_id === unit.sku.source_id,
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
      return await this.orderService.redeemVoucherifyCoupons(order);
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
}
