import { Body, Controller, Get, Res, Post, ValidationPipe, Param, Put, Delete } from '@nestjs/common';
import { createProductDto } from './Models/createProduct.dto';
const { PrismaClient } = require('@prisma/client'); //Importamos el cliente de prisma
const prisma = new PrismaClient(); //Creamos una instancia de prisma
import { Response } from 'express';
import { AppService } from 'src/app.service';


@Controller('product')
export class ProductController {

@Post('create')
async createProduct(
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  dto: createProductDto,
) {
  try {
    const product = await prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        picture: dto.picture,
        category: dto.category,
        fragile: dto.fragile,
      },
    });

    return {
      success: true,
      status: 201,
      data: product,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Error creating product',
      error: error.message,
    };
  }
}

@Get('getAll')
async getAllProducts(@Res() res: Response) {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json({
      success: true,
      status: 200,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error fetching products',
      error: error.message,
    });
  }
}

@Get('getById/:id')
async getProductById(@Res() res: Response, @Param('id') id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Product not found',
      });
    }
    return res.status(200).json({
      success: true,
      status: 200,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error fetching product',
      error: error.message,
    });
  }
}

@Put('update/:id')
async updateProduct(
  @Res() res: Response,
  @Param('id') id: string,
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  dto: createProductDto,
) {
  try {
    const exists  = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!exists) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Product not found',
      });
    }
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        picture: dto.picture,
        category: dto.category,
        fragile: dto.fragile,
      },
    });
    
    return res.status(200).json({
      success: true,
      status: 200,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error updating product',
      error: error.message,
    });
  }
}

@Delete('delete/:id')
async deleteProduct(@Res() res: Response, @Param('id') id: string) {
  try {
    const exists  = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!exists) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Product not found',
      });
    }
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Product deleted successfully',
      data: exists
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error deleting product',
      error: error.message,
    });
  }
}
}
