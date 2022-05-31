import {
  Controller,
  Post,
  Body,
  HttpException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { TimeLoggingInterceptor } from 'src/misc/time-logging.interceptor';
import { CartOrderDto } from 'src/api-extension/CartOrder.dto';
import { ApiExtensionGuard } from './api-extension.guard';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { Cart, Order } from '@commercetools/platform-sdk';

@UseInterceptors(TimeLoggingInterceptor)
@Controller('api-extension')
@UseGuards(ApiExtensionGuard)
export class ApiExtensionController {
  constructor(
    private readonly apiExtensionService: CartService,
    private readonly orderService: OrderService,
  ) {}

  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    ApiExtensionController.name,
  );

  @Post()
  async handleApiExtensionRequest(@Body() body: CartOrderDto): Promise<any> {
    const type = body.resource?.typeId;
    const action = body.action;
    const id = body.resource?.obj?.id;

    this.logger.info({
      msg: 'Handle Commerce Tools API Extension',
      type,
      id,
      action,
    });

    if (type === 'cart') {
      const response = await this.apiExtensionService.checkCartAndMutate(
        body.resource.obj as Cart,
      );
      if (!response.status) {
        throw new HttpException('', 400);
      }

      return { actions: response.actions };
    }
    if (type === 'order') {
      const response = await this.orderService.redeemVoucherifyCoupons(
        body.resource.obj as Order,
      );
      return { actions: response.actions };
    }

    return { status: 200, actions: [] };
  }
}
