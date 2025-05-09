import {Module} from '@nestjs/common';
import { GeneralInventoryController } from './inventory.controller';



@Module({
    controllers: [GeneralInventoryController],
    imports: []
})

export class GeneralInventoryModule {
   
};