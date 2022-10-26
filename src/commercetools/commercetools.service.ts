import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../integration/order.service';
import { Cart, Order, Product } from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import sleep from '../integration/utils/sleep';
import { CartResponse, PriceSelector } from '../integration/types';
import { TypesService } from './types/types.service';

@Injectable()
export class CommercetoolsService {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: Logger,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly typesService: TypesService,
  ) {}

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

  public async getCommercetoolstCurrentPrice(
    ctProduct: Product,
    productSkuSourceId: string,
    priceSelector: PriceSelector,
  ) {
    let ctVariants =
      ctProduct.masterData.current.variants.length > 0
        ? ctProduct.masterData.current.variants
        : [ctProduct.masterData.current.masterVariant];

    ctVariants = ctVariants.filter(
      (variant) => variant.sku === productSkuSourceId,
    );

    const prices = [];
    // price.country and price.customerGroup could be set to 'any' we don't to
    // remove these elements from prices
    // The priority order for the selection of the price is customer group > channel > country
    // https://docs.commercetools.com/api/projects/carts#lineitem-price-selection
    ctVariants.map((variant) => {
      let filteredPrices = variant.prices;

      if (priceSelector.customerGroup) {
        const customerGroupPrices = filteredPrices.filter(
          (price) =>
            price.customerGroup &&
            price.customerGroup.typeId === priceSelector.customerGroup.typeId &&
            price.customerGroup.id === priceSelector.customerGroup.id,
        );

        if (customerGroupPrices.length) {
          filteredPrices = customerGroupPrices;
        }
      }

      if (priceSelector.distributionChannels.length) {
        const channel = priceSelector.distributionChannels[0];
        const channelsPrices = filteredPrices.filter(
          (price) =>
            price.channel &&
            price.channel.typeId === channel.typeId &&
            price.channel.id === channel.id,
        );

        if (channelsPrices.length) {
          filteredPrices = channelsPrices;
        }
      }

      filteredPrices = filteredPrices.filter(
        (price) =>
          price.value.currencyCode === priceSelector.currencyCode &&
          (!price.country || price.country === priceSelector.country),
      );

      prices.push(
        ...filteredPrices.filter((price) => price.country),
        ...filteredPrices.filter((price) => !price.country),
      );
    });

    const currentPrice = prices[0];

    return currentPrice?.value?.centAmount ? currentPrice.value.centAmount : 0;
  }
}
