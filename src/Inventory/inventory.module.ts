import {Module} from '@nestjs/common';
import { GeneralInventoryController } from './inventory.controller';
import { GeneralModule } from '../common/general.module';


@Module({
    controllers: [GeneralInventoryController],
    imports: [GeneralModule]
})

export class GeneralInventoryModule {
   
};