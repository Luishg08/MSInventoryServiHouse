import {Module} from '@nestjs/common';
import { StockController } from './stock.controller';
import { GeneralModule } from '../common/general.module';

@Module({
    controllers: [StockController],
    imports: [GeneralModule]
})

export class StockModule {};
