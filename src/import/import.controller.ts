import { Controller, Get } from '@nestjs/common';
import { OrderImport } from './order-import.service';
import { ProductImport } from './product-import.service';

@Controller('import')
export class ImportController {
  constructor(
    private readonly productImport: ProductImport,
    private readonly orderImport: OrderImport,
  ) {}
  @Get()
  async configure() {
    const migrationStatus = await this.productImport.migrateProducts();
    // this.orderImport.orderImport()

    return migrationStatus;
  }
}
