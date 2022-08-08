import {
  Controller,
  Post,
  Body,
  HttpException,
  UseGuards,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { TimeLoggingInterceptor } from 'src/misc/time-logging.interceptor';
import { CartOrderDto } from 'src/api-extension/CartOrder.dto';
import { ApiExtensionGuard } from './api-extension.guard';
import { Cart, Order } from '@commercetools/platform-sdk';
import { I18n, I18nContext } from 'nestjs-i18n';

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
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    // console.log('aaaaaaaaaaaaaaaa', await i18n.t('test.coupon'))
    console.log(body.resource.obj.totalPrice);
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
