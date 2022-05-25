import {
  Controller,
  Post,
  Req,
  Body,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiExtensionService } from './api-extension.service';
import { OrderService } from './order.service';
import { TimeLoggingInterceptor } from 'src/misc/time-logging.interceptor';
import { CartOrderDto } from 'src/misc/CartOrder.dto';

@UseInterceptors(TimeLoggingInterceptor)
@Controller('api-extension')
export class ApiExtensionController {
  constructor(
    private readonly apiExtensionService: ApiExtensionService,
    private readonly orderService: OrderService,
  ) {}

  @Post()
  async handleApiExtensionRequest(
    @Body() body: CartOrderDto,
    @Req() request: Request,
  ): Promise<any> {
    const type = body.resource?.typeId;
    const authorization = request?.headers?.authorization;
    if (
      process.env.API_EXTENSION_BASIC_AUTH_PASSWORD?.length &&
      authorization !== `Basic ${process.env.API_EXTENSION_BASIC_AUTH_PASSWORD}`
    ) {
      throw new HttpException('', 400);
    }

    if (type === 'cart') {
      const response = await this.apiExtensionService.checkCartAndMutate(body);
      if (!response.status) {
        throw new HttpException('', 400);
      }
      return { actions: response.actions };
    }
    if (type === 'order') {
      const response = await this.orderService.redeemVoucherifyCoupons(body);
      return { actions: response.actions };
    }
    return { status: 200, actions: [] };
  }
}
