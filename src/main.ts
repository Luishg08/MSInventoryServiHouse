import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require('dotenv').config();
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; //Importamos dependencias para swagger
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/inventory/')
  const config = new DocumentBuilder()
    .setTitle('MSInventory')
    .setDescription('Documentación de la API de MSInventory')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/Inventory/docs', app, document);
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
bootstrap();
