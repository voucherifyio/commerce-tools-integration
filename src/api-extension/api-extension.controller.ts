import {
  Controller,
  Post,
  Body,
  HttpException,
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

@UseInterceptors(TimeLoggingInterceptor)
@Controller('api-extension')
@UseGuards(ApiExtensionGuard)
export class ApiExtensionController {
  constructor(
    private readonly apiExtensionService: CartService,
    private readonly orderService: OrderService,
    private readonly logger: Logger,
  ) {}

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
      const cart = body.resource.obj as Cart;
      const response = await this.apiExtensionService.checkCartAndMutate(cart);
      if (!response.status) {
        throw new HttpException('', 400);
      }
      if (!response.validateCouponsResult || !response.actions.length) {
        return responseExpress.status(200).json({ actions: response.actions });
      }
      responseExpress.status(200).json({ actions: response.actions });
      return await this.apiExtensionService.checkCartMutateFallback(cart);
    }
    if (type === 'order') {
      const response = await this.orderService.redeemVoucherifyCoupons(
        body.resource.obj as Order,
      );
      if (!response?.redemptionsRedeemStackableResponse) {
        return responseExpress.status(200).json({ actions: response.actions });
      }
      responseExpress.status(200).json({ actions: response.actions });
      return await this.orderService.checkPaidOrderFallback(
        (body.resource.obj as Order).id,
        response.redemptionsRedeemStackableResponse,
      );
    }

    return responseExpress.status(200).json({ actions: [] });
  }
}
