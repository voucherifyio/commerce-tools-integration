import { Command, CommandRunner, Option } from 'nest-commander';
import loadingCli from 'loading-cli';
import { CustomerImportService } from '../import/customer-import.service';

interface MigrateCustomersCommandOptions {
  period?: number;
}

@Command({
  name: 'migrate-customers',
  description: `sync all of the "PAID" orders from commercetools to Voucherify. (might be throttled by Voucherify)
  - add "period" argument to sync orders from last X days (e.g. "npm run migrate-orders -- --period=5") `,
})
export class MigrateCustomersCommand implements CommandRunner {
  constructor(private readonly customerImportService: CustomerImportService) {}

  @Option({
    flags: '-p, --period [number]',
    description: 'Sync orders from last X days',
  })
  parsePeriod(val: string): number {
    return Number(val);
  }

  async run(
    passedParam: string[],
    options?: MigrateCustomersCommandOptions,
  ): Promise<void> {
    const spinnerCouponsTypes = loadingCli(
      options.period
        ? `Attempt to migrate customers from last ${options.period} days`
        : `Attempt to migrate customers`,
    ).start();

    const result = await this.customerImportService.migrateCustomers(
      options.period,
    );

    if (result.success) {
      spinnerCouponsTypes.succeed('Customers successfully migrated');
    } else {
      spinnerCouponsTypes.fail('Could not migrate customers');
    }
  }
}
