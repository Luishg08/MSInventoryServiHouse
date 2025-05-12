import {Module} from '@nestjs/common';
import { StorageController } from './storage.controller';
import { GeneralModule } from 'src/common/general.module';

@Module({
    controllers: [StorageController],
    imports: [GeneralModule]
})

export class StorageModule {};