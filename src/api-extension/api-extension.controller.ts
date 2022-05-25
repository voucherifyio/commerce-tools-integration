import {
  Controller,
  Post,
  Req,
  Body,
  HttpException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiExtensionService } from './api-extension.service';
import { OrderService } from './order.service';
import { TimeLoggingInterceptor } from 'src/misc/time-logging.interceptor';
import { CartOrderDto } from 'src/api-extension/CartOrder.dto';
import { ApiExtensionGuard } from './api-extension.guard';
import { JsonLogger, LoggerFactory } from 'json-logger-service';
import { Order } from '@commercetools/platform-sdk';
@UseInterceptors(TimeLoggingInterceptor)
@Controller('api-extension')
@UseGuards(ApiExtensionGuard)
export class ApiExtensionController {
  constructor(
    private readonly apiExtensionService: ApiExtensionService,
    private readonly orderService: OrderService,
  ) {}

  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    ApiExtensionController.name,
  );

  @Post()
  async handleApiExtensionRequest(@Body() body: CartOrderDto): Promise<any> {
    const type = body.resource?.typeId;

    if (type === 'cart') {
      const response = await this.apiExtensionService.checkCartAndMutate(body);
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
