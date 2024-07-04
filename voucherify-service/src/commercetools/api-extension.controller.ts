import {
  Body,
  Controller,
  Logger,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CartOrderDto } from './dto/CartOrder.dto';
import { ApiExtensionGuard } from './api-extension.guard';
import { Cart, Order } from '@commercetools/platform-sdk';
import { Response } from 'express';
import { performance } from 'perf_hooks';
import { elapsedTime } from '../misc/elapsedTime';
import { CommercetoolsService } from './commercetools.service';
import { HandleTimeoutInterceptor } from './handle-timeout-interceptor.service';

@Controller('api-extension')
@UseGuards(ApiExtensionGuard)
@UseInterceptors(HandleTimeoutInterceptor)
export class ApiExtensionController {
  constructor(
    private readonly logger: Logger,
    private readonly commercetoolsService: CommercetoolsService,
  ) {}

  async handleRequestCart(cart: Cart, responseExpress: Response) {
    let response;
    try {
      const start = performance.now();
      response = await this.commercetoolsService.handleCartUpdate(cart);
      this.logger.debug(
        `handleRequestCart->handleCartUpdate: ${elapsedTime(
          start,
          performance.now(),
        )}`,
      );
    } catch (e) {
      console.log(e); //can't use the logger because it cannot handle error objects
      this.logger.error({
        msg: `Error while commercetoolsService.handleCartUpdate function`,
      });
      return responseExpress.status(200).json({ actions: [] });
    }
    if (!response?.status) {
      return responseExpress.status(400).json({});
    }
    return responseExpress.status(200).json({ actions: response.actions });
  }

  async handleRequestOrder(order: Order, responseExpress: Response) {
    responseExpress.status(200).json({
      actions: [],
    });
    await this.commercetoolsService.checkIfCartStatusIsPaidAndRedeem(order);
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
