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
    try {
      if (type === 'cart') {
        const cart = body.resource.obj as Cart;
        try {
          const response = await this.apiExtensionService.checkCartAndMutate(
            cart,
          );
          if (!response?.status) {
            return responseExpress.status(400).json({});
          }
          if (!response.validateCouponsResult || !response.actions.length) {
            return responseExpress
              .status(200)
              .json({ actions: response.actions });
          }
          responseExpress.status(200).json({ actions: response.actions });
        } catch (error) {
          console.log(error); //Do not change it to logger
          return await this.apiExtensionService.checkCartMutateFallback(cart);
        }
        return await this.apiExtensionService.checkCartMutateFallback(cart);
      }
      if (type === 'order') {
        const { paymentState } = body.resource.obj as Order;
        responseExpress.status(200).json({
          actions: paymentState
            ? [
                {
                  action: 'changePaymentState',
                  paymentState: paymentState === 'Paid' ? 'Failed' : 'Paid',
                },
                {
                  action: 'changePaymentState',
                  paymentState: paymentState === 'Paid' ? 'Paid' : paymentState,
                },
              ]
            : [],
        });
        await this.orderService.redeemVoucherifyCoupons(
          body.resource.obj as Order,
        );
        return;
      }

      return responseExpress.status(200).json({ actions: [] });
    } catch (error) {
      console.log(error); //Do not change it to logger
      return responseExpress.status(200).json({ actions: [] });
    }
  }
}
