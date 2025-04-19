import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { inventoryTestController } from './InventoryTest/inventoryTest.controller';

@Module({
  imports: [],
  controllers: [inventoryTestController],
  providers: [],
})
export class AppModule {}
