import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require('dotenv').config();
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; //Importamos dependencias para swagger



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/inventory/')
  const config = new DocumentBuilder()
    .setTitle('MSInventory')
    .setDescription('Documentación de la API de MSInventory')
    .setVersion('1.0')
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);  
    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
}
bootstrap();
