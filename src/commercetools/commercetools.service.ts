import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../integration/order.service';
import { Order } from '@commercetools/platform-sdk';
import { CommercetoolsConnectorService } from './commercetools-connector.service';
import sleep from '../integration/utils/sleep';

@Injectable()
export class CommercetoolsService {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: Logger,
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
  ) {}

  public async checkIfCartWasUpdatedWithStatusPaidAndRedeem(
    orderFromRequest: Order,
  ) {
    if (orderFromRequest.paymentState !== 'Paid') {
      return this.logger.debug({
        msg: 'Order is not paid',
        id: orderFromRequest.id,
        customerId: orderFromRequest.customerId,
      });
    }
    await sleep(650);
    const order = await this.commerceToolsConnectorService.findOrder(
      orderFromRequest.id,
    );
    if (
      order.version <= orderFromRequest.version ||
      order.paymentState !== 'Paid'
    ) {
      return this.logger.debug({
        msg: `Order was not modified, payment state: ${order.paymentState}`,
        id: orderFromRequest.id,
        customerId: orderFromRequest.customerId,
      });
    }
    try {
      return await this.orderService.redeemVoucherifyCoupons(order);
    } catch (e) {
      console.log(e);
      this.logger.error({
        msg: `Error while redeemVoucherifyCoupons function`,
      });
    }
  }
}
