import { Controller, Post, Body, UseGuards, Logger, Res } from '@nestjs/common';
import { IntegrationService } from '../integration/integration.service';
import { CartOrderDto } from './dto/CartOrder.dto';
import { ApiExtensionGuard } from './api-extension.guard';
import { Cart, Order } from '@commercetools/platform-sdk';
import { Response } from 'express';
import { performance } from 'perf_hooks';
import { elapsedTime } from '../misc/elapsedTime';
import { CommercetoolsService } from './commercetools.service';
import { getActionsForAPIExtensionTypeOrder } from './utils/getActionsForAPIExtensionTypeOrder';

@Controller('api-extension')
@UseGuards(ApiExtensionGuard)
export class ApiExtensionController {
  constructor(
    private readonly cartService: IntegrationService,
    private readonly logger: Logger,
    private readonly commercetoolsService: CommercetoolsService,
  ) {}

  async handleRequestCart(cart: Cart, responseExpress: Response) {
    let response;
    try {
      const start = performance.now();
      response =
        await this.commercetoolsService.validateCouponsAndPromotionsAndBuildCartActionsOrSetCustomTypeForInitializedCart(
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
        msg: `Error while commercetoolsService.validatePromotionsAndBuildCartActions function`,
      });
      return responseExpress.status(200).json({ actions: [] });
    }
    if (!response?.status) {
      return responseExpress.status(400).json({});
    }
    responseExpress.status(200).json({ actions: response.actions });
    //coupons ???
    try {
      this.commercetoolsService.checkIfAPIExtensionRespondedOnTimeAndRevalidateCouponsIfNot(
        cart,
      ); //don't wait
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while commercetoolsService.checkIfAPIExtensionRespondedOnTimeAndRevalidateCouponsIfNot function`,
      });
    }
    return;
  }

  async handleRequestOrder(order: Order, responseExpress: Response) {
    const { paymentState } = order;
    responseExpress.status(200).json({
      actions: getActionsForAPIExtensionTypeOrder(paymentState),
    });
    this.commercetoolsService.checkIfCartWasUpdatedWithStatusPaidAndRedeem(
      order,
    ); //don't wait
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
