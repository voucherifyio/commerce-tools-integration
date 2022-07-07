import { Controller, Get } from '@nestjs/common';
import { OrderImportService } from './order-import.service';
import { ProductImportService } from './product-import.service';

@Controller('import')
export class ImportController {
  constructor(
    private readonly productImportService: ProductImportService,
    private readonly orderImportService: OrderImportService,
  ) {}
  @Get()
  async configure() {
    const migrationStatus = await this.productImportService.migrateProducts();
    const orderStatus = this.orderImportService.migrateOrders();

    return { migrationStatus, orderStatus };
  }
}
