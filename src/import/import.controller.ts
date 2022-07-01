import { Controller, Get } from '@nestjs/common';
import { OrderImport } from './order-import.service';
import { ProductImportService } from './product-import.service';

@Controller('import')
export class ImportController {
  constructor(
    private readonly productImportService: ProductImportService,
    private readonly orderImport: OrderImport,
  ) {}
  @Get()
  async configure() {
    const migrationStatus = await this.productImportService.migrateProducts();
    // this.orderImport.orderImport()

    return migrationStatus;
  }
}
