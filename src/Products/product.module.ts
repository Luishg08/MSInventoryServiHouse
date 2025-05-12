import {Module} from '@nestjs/common';
import { ProductController } from './product.controller';
import { GeneralModule } from '../common/general.module';

@Module({
    controllers: [ProductController],
    imports: [GeneralModule]
})

export class ProductModule {};