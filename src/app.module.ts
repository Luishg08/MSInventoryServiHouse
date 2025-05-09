import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './Products/product.controller';
import { StorageController } from './Storage/storage.controller';
import { GeneralInventoryController } from './Inventory/inventory.controller';

@Module({
  imports: [],
  controllers: [ProductController, StorageController, GeneralInventoryController],
  providers: [],
})
export class AppModule {}
