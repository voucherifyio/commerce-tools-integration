import { Controller, Post, Body, UseGuards, Logger, Res } from '@nestjs/common';
import { CartService } from '../integration/cart.service';
import { OrderService } from '../integration/order.service';
import { CartOrderDto } from './CartOrder.dto';
import { ApiExtensionGuard } from './api-extension.guard';
import { Cart, Order } from '@commercetools/platform-sdk';
import { Response } from 'express';
import { actionsForAPIExtensionTypeOrder } from '../misc/actionsForAPIExtensionTypeOrder';
import { performance } from 'perf_hooks';
import { elapsedTime } from '../misc/elapsedTime';
import { CommercetoolsService } from './commercetools.service';

@Controller('api-extension')
@UseGuards(ApiExtensionGuard)
export class ApiExtensionController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly logger: Logger,
    private readonly commercetoolsService: CommercetoolsService,
  ) {}

  async handleRequestCart(cart: Cart, responseExpress: Response) {
    if (cart.version === 1) {
      return responseExpress
        .status(200)
        .json(this.commercetoolsService.setCustomTypeForInitializedCart());
    }
    let response;
    try {
      const start = performance.now();
      response =
        await this.commercetoolsService.validatePromotionsAndBuildCartActions(
          cart,
        );
      const end = performance.now();
      this.logger.debug(
        `handleRequestCart->validatePromotionsAndBuildCartActions: ${elapsedTime(
          start,
          end,
        )}`,
      );
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while validatingPromotionsAndBuildingCartActions function`,
      });
      return responseExpress.status(200).json({ actions: [] });
    }
    if (!response?.status) {
      return responseExpress.status(400).json({});
    }
    if (!response.validateCouponsResult || !response.actions.length) {
      return responseExpress.status(200).json({ actions: response.actions });
    }
    responseExpress.status(200).json({ actions: response.actions });
    try {
      return await this.commercetoolsService.validatePromotionsAndBuildCartActionsFallback(
        cart,
      );
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while validatePromotionsAndBuildCartActionsFallback function`,
      });
    }
    return;
  }

  async handleRequestOrder(order: Order, responseExpress: Response) {
    const { paymentState } = order;
    responseExpress.status(200).json({
      actions: actionsForAPIExtensionTypeOrder(paymentState),
    });
    return await this.commercetoolsService.checkIfCartWasUpdatedWithStatusPaidAndRedeem(
      order,
    );
  }

  @Post()
  async handleApiExtensionRequest(
    @Body() body: CartOrderDto,
    @Res() responseExpress: Response,
  ): Promise<any> {
    const type = body.resource?.typeId;
    const action = body.action;
    const id = body.resource?.obj?.id;

    this.logger.debug({
      msg: 'Handle Commerce Tools API Extension',
      type,
      id,
      action,
    });
    if (type === 'cart') {
      return await this.handleRequestCart(
        body.resource.obj as Cart,
        responseExpress,
      );
    }
    if (type === 'order') {
      return this.handleRequestOrder(
        body.resource.obj as Order,
        responseExpress,
      );
    }
  }
}
