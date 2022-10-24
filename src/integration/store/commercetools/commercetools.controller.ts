import { Body, Controller, Post, Res, UseGuards, Logger } from '@nestjs/common';
import { CommercetoolsService } from './commercetools.service';
import { ApiExtensionGuard } from './api-extension.guard';
import { ApiExtensionDto } from './api-extension.dto';
import { Response } from 'express';
import { Cart, Order } from '@commercetools/platform-sdk';

@Controller('newAPI')
@UseGuards(ApiExtensionGuard)
export class CommercetoolsController {
  constructor(
    private readonly commercetoolsService: CommercetoolsService,
    private readonly logger: Logger,
  ) {}

  @Post()
  async cartOrOrderUpdate(
    @Body() body: ApiExtensionDto,
    @Res() responseExpress: Response,
  ) {
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
      return this.commercetoolsService.handleApiExtension(
        body.resource.obj as Cart,
      );
    }
    if (type === 'order') {
      //   return this.handleRequestOrder(
      //     body.resource.obj as Order,
      //     responseExpress,
      //   );
    }
  }
}
