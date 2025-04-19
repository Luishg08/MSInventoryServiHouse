import {Module} from '@nestjs/common';
import { inventoryTestController } from './inventoryTest.controller';

@Module({
    controllers: [inventoryTestController]
})

export class InventoryModule {};