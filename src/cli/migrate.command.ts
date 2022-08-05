import { Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import loadingCli from 'loading-cli';
import { ProductImportService } from '../import/product-import.service';
import { OrderImportService } from '../import/order-import.service';
import { CustomerImportService } from '../import/customer-import.service';

type ResourceTypeArg = {
  name: 'products' | 'orders' | 'customers';
  callback: (period?: string) => Promise<{ success: true | false }>;
};

interface MigrateCommandOptions {
  type: ResourceTypeArg;
  days?: string;
  hours?: string;
  ms?: string;
  date?: string;
  longdate?: string;
}

@Command({
  name: 'migrate',
  description:
    'Sync resources from commercetools to Voucherify. You can add optional argument to sync not all resources, but from specific time',
})
export class MigrateCommand implements CommandRunner {
  constructor(
    private readonly productImportService: ProductImportService,
    private readonly orderImportService: OrderImportService,
    private readonly customerImportService: CustomerImportService,
    private readonly logger: Logger,
  ) {}

  @Option({
    flags: '--type [string]',
    description: `Required. Type of resource you want to sync. Values: 'products', 'orders', 'customers'`,
  })
  parseType(val: string): ResourceTypeArg {
    switch (val) {
      case 'products':
        return {
          name: 'products',
          callback: this.productImportService.migrateProducts.bind(
            this.productImportService,
          ),
        };
      case 'orders':
        return {
          name: 'orders',
          callback: this.orderImportService.migrateOrders.bind(
            this.orderImportService,
          ),
        };
      case 'customers':
        return {
          name: 'customers',
          callback: this.customerImportService.migrateCustomers.bind(
            this.customerImportService,
          ),
        };
    }
    return null;
  }

  @Option({
    flags: '--days [number]',
    description: 'Sync from last X days',
  })
  parseDays(val: string): string {
    const date = new Date();
    const matched = val.match(/[0-9]{1,}/g);
    date.setDate(date.getDate() - parseInt(matched[0]));
    return date.toJSON();
  }

  @Option({
    flags: '--hours [number]',
    description: 'Sync from last X hours',
  })
  parseHours(val: string): string {
    const date = new Date();
    const matched = val.match(/[0-9]{1,}/g);
    date.setHours(date.getHours() - parseInt(matched[0]));
    return date.toJSON();
  }
  @Option({
    flags: '--ms [number]',
    description: 'Sync from last X milliseconds',
  })
  parseMs(val: string): string {
    const date = new Date();
    const matched = val.match(/[0-9]{1,}/g);
    date.setMilliseconds(date.getMilliseconds() - parseInt(matched[0]));
    return date.toJSON();
  }

  @Option({
    flags: '--date [string]',
    description: `Sync from specific date. Format: 'YYYY-MM-DD'`,
  })
  parseDate(val: string): string {
    const date = new Date();
    const matched = val.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g);
    date.setTime(Date.parse(matched[0]));
    return date.toJSON();
  }

  @Option({
    flags: '--longdate [string]',
    description: `Sync from specific date and time. Format: 'YYYY-MM-DDTHH:MM:SS'`,
  })
  parseLongDate(val: string): string {
    const date = new Date();
    const matched = val.match(
      /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}/g,
    );
    date.setTime(Date.parse(matched[0]));
    return date.toJSON();
  }

  async run(
    passedParams: string[],
    options: MigrateCommandOptions,
  ): Promise<void> {
    if (!options.type) {
      this.logger.warn(
        `You didn't pass --type argument or it's value is not correct. Possible values are : 'products', 'orders', 'customers'`,
      );
      return;
    }
    
    const fetchTime =
      options.days ||
      options.hours ||
      options.ms ||
      options.date ||
      options.longdate ||
      null;

    const spinnerCouponsTypes = loadingCli(
      fetchTime
        ? `Attempt to migrate ${options.type.name} from ${fetchTime}`
        : `Attempt to migrate ${options.type.name}`,
    ).start();

    const result = await options.type.callback(fetchTime);

    if (result.success) {
      spinnerCouponsTypes.succeed(`${options.type.name} successfully migrated`);
    } else {
      spinnerCouponsTypes.fail(`Could not migrate ${options.type.name}`);
    }
  }
}
