import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Logger,
  Res,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { TimeLoggingInterceptor } from 'src/misc/time-logging.interceptor';
import { CartOrderDto } from 'src/api-extension/CartOrder.dto';
import { ApiExtensionGuard } from './api-extension.guard';
import { Cart, Order } from '@commercetools/platform-sdk';
import { Response } from 'express';
import { actionsForAPIExtensionTypeOrder } from '../misc/actionsForAPIExtensionTypeOrder';

@UseInterceptors(TimeLoggingInterceptor)
@Controller('api-extension')
@UseGuards(ApiExtensionGuard)
export class ApiExtensionController {
  constructor(
    private readonly apiExtensionService: CartService,
    private readonly orderService: OrderService,
    private readonly logger: Logger,
  ) {}

  async handleRequestCart(cart: Cart, responseExpress: Response) {
    let response;
    try {
      response =
        await this.apiExtensionService.validatePromotionsAndBuildCartActions(
          cart,
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
      return await this.apiExtensionService.validatePromotionsAndBuildCartActionsFallback(
        cart,
      );
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while validatePromotionsAndBuildCartActionsFallback function`,
      });
    }
  }

  async handleRequestOrder(order: Order, responseExpress: Response) {
    const { paymentState } = order;
    responseExpress.status(200).json({
      actions: actionsForAPIExtensionTypeOrder(paymentState),
    });
    try {
      await this.orderService.redeemVoucherifyCoupons(order);
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while redeemVoucherifyCoupons function`,
      });
    }
    return;
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
