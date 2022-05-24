import {
  Controller,
  Post,
  Req,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiExtensionService } from './api-extension.service';
import { OrderService } from './order.service';
import { TimeLoggingInterceptor } from 'src/misc/time-logging.interceptor';

@UseInterceptors(new TimeLoggingInterceptor())
@Controller('api-extension')
export class ApiExtensionController {
  constructor(
    private readonly apiExtensionService: ApiExtensionService,
    private readonly orderService: OrderService,
  ) {}

  @Post()
  async findAll(@Req() request: Request): Promise<any> {
    const type = request?.body?.resource?.typeId;
    const authorization = request?.headers?.authorization;
    if (
      process.env.API_EXTENSION_BASIC_AUTH_PASSWORD?.length &&
      authorization !== `Basic ${process.env.API_EXTENSION_BASIC_AUTH_PASSWORD}`
    ) {
      throw new HttpException('', 400);
    }

    if (type === 'cart') {
      const response = await this.apiExtensionService.checkCartAndMutate(
        request?.body,
      );
      if (!response.status) {
        throw new HttpException('', 400);
      }
      return { actions: response.actions };
    } else if (type === 'order') {
      const response = await this.orderService.redeemVoucherifyCoupons(
        request?.body,
      );
      return { actions: response.actions };
    }
  }
}
