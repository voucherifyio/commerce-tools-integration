import { Command, CommandRunner, Option } from 'nest-commander';
import loadingCli from 'loading-cli';
import { ProductImportService } from '../import/product-import.service';

interface MigrateProductsCommandOptions {
  period?: number;
}

@Command({
  name: 'migrate-products',
  description: `Sync all products from commercetools to Voucherify.
  - add "period" argument to sync products from last X days (e.g. "npm run migrate-products -- --period=5")`,
})
export class MigrateProductsCommand implements CommandRunner {
  constructor(private readonly productImportService: ProductImportService) {}

  @Option({
    flags: '-p, --period [number]',
    description: 'Sync products from last X days',
  })
  parsePeriod(val: string): number {
    return Number(val);
  }

  async run(
    passedParam: string[],
    options?: MigrateProductsCommandOptions,
  ): Promise<void> {
    const spinnerCouponsTypes = loadingCli(
      options.period
        ? `Attempt to migrate products from last ${options.period} days`
        : `Attempt to migrate products`,
    ).start();

    const result = await this.productImportService.migrateProducts(
      options.period,
    );

    if (result.success) {
      spinnerCouponsTypes.succeed('Products successfully migrated');
    } else {
      spinnerCouponsTypes.fail('Could not migrate products');
    }
  }
}
