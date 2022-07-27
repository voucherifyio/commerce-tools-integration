import { Command, CommandRunner, Option } from 'nest-commander';
import loadingCli from 'loading-cli';
import { OrderImportService } from '../import/order-import.service';

interface MigrateOrdersCommandOptions {
  period?: number;
}

@Command({
  name: 'migrate-orders',
  description: `Sync all of the "PAID" orders from commercetools to Voucherify. (might be throttled by Voucherify)
  - add "period" argument to sync orders from last X days (e.g. "npm run migrate-orders -- --period=5")`,
})
export class MigrateOrdersCommand implements CommandRunner {
  constructor(private readonly orderImportService: OrderImportService) {}

  @Option({
    flags: '-p, --period [number]',
    description: 'Sync orders from last X days',
  })
  parsePeriod(val: string): number {
    return Number(val);
  }

  async run(
    passedParam: string[],
    options?: MigrateOrdersCommandOptions,
  ): Promise<void> {
    const spinnerCouponsTypes = loadingCli(
      options.period
        ? `Attempt to migrate orders from last ${options.period} days`
        : `Attempt to migrate orders`,
    ).start();

    const result = await this.orderImportService.migrateOrders(options.period);

    if (result.success) {
      spinnerCouponsTypes.succeed('Orders successfully migrated');
    } else {
      spinnerCouponsTypes.fail('Could not migrate orders');
    }
  }
}
