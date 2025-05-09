import {Module} from '@nestjs/common';
import { ProductController } from './product.controller';
import { AppModule } from 'src/app.module';

@Module({
    controllers: [ProductController],
    imports: []
})

export class ProductModule {};