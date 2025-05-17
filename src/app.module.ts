import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './Products/product.controller';
import { StorageController } from './Storage/storage.controller';
import { GeneralInventoryController } from './Inventory/inventory.controller';
import { ProductModule } from './Products/product.module';
import { GeneralModule } from './common/general.module';
import { StockController } from './Stock/stock.controller';

@Module({
  imports: [ProductModule, GeneralModule],
  controllers: [ProductController, StorageController, GeneralInventoryController, StockController],
  providers: [],
})
export class AppModule {}
