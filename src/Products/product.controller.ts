import { Body, Controller, Get, Res, Post, ValidationPipe, Param, Put, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { createProductDto } from './Models/createProduct.dto';
const { PrismaClient } = require('@prisma/client'); //Importamos el cliente de prisma
const prisma = new PrismaClient(); //Creamos una instancia de prisma
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
const csv = require('csv-parser');
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { GeneralService } from 'src/common/general.service';


@Controller('product')
export class ProductController {
  constructor(private readonly generalService: GeneralService) { }
  @Post('create')
  async createProduct(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: createProductDto, @Req() req: Request, @Res() res: Response
  ) {
    const { message, success } = this.generalService.verifyToken(req, 'createProduct');
    if (!success) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: message
      });
    }
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

      return res.status(201).json({
        success: true,
        status: 201,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: 'Error creating product',
        error: error.message,
      });
    }
  }

  @Get('getAll')
  async getAllProducts(@Res() res: Response, @Req() req: Request) {
    const { message, success } = this.generalService.verifyToken(req, 'getAllProducts');
    if (!success) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: message
      });
    }
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
  async getProductById(@Res() res: Response, @Param('id') id: string, @Req() req: Request) {
    const { message, success } = this.generalService.verifyToken(req, 'getProductById');
    if (!success) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: message
      });
    }

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
    dto: createProductDto, @Req() req: Request
  ) {
    const { message, success } = this.generalService.verifyToken(req, 'updateProduct');
    if (!success) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: message
      });
    }
    try {
      const exists = await prisma.product.findUnique({
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
  async deleteProduct(@Res() res: Response, @Param('id') id: string, @Req() req: Request) {
    const { message, success } = this.generalService.verifyToken(req, 'deleteProduct');
    if (!success) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: message
      });
    }
    try {
      const exists = await prisma.product.findUnique({
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

  @Post('uploadProducts')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `products-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadProducts(
    @UploadedFile() file: Express.Multer.File, @Res() res: Response, @Req() req: Request
  ) {
    // const { message, success } = this.generalService.verifyToken(req, 'uploadFile');
    // if (!success) {
    //   return res.status(401).json({
    //     status: false,
    //     code: 401,
    //     message: message
    //   });
    // }
    if (!file || file.mimetype !== 'text/csv') {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Invalid file type. Please upload a CSV file.',
      });
    }
    try {
      this.generalService.logger.info(`Processing file: ${file.originalname}`);
      const filePath = path.resolve(file.path);
      const fileStream = fs.createReadStream(filePath);
      const productData = [];
      fileStream
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          const requiredColumns = [
            'id_producto',
            'id_almacen',
            'nombre_producto',
            'categoria',
            'descripcion',
            'sku',
            'codigo_barras',
            'precio_unitario',
            'cantidad_stock',
            'nivel_reorden',
            'ultima_reposicion',
            'fecha_vencimiento',
            'id_proveedor',
            'peso_kg',
            'dimensiones_cm',
            'es_fragil',
            'requiere_refrigeracion',
            'estado',
          ];
          const missingColumns = requiredColumns.filter((col) => !row[col]);
          if (missingColumns.length > 0) {
            this.generalService.logger.error(`Missing columns: ${missingColumns.join(', ')} in row: ${JSON.stringify(row)}`);
          }
          else {
            this.generalService.logger.info(`Processing row: ${JSON.stringify(row)}`);
            productData.push(row);
          };
        })
        .on('end', async () => {
          const productPromises = productData.map(async (rowProduct) => {
            try {
              const {
                id_producto,
                id_almacen,
                nombre_producto,
                categoria,
                descripcion,
                sku,
                codigo_barras,
                precio_unitario,
                cantidad_stock,
                nivel_reorden,
                ultima_reposicion,
                fecha_vencimiento,
                id_proveedor,
                peso_kg,
                dimensiones_cm,
                es_fragil,
                requiere_refrigeracion,
                estado,
              } = rowProduct;

              const provider = await prisma.provider.upsert({
                where: { id: id_proveedor },
                update: {
                  name: id_proveedor
                },
                create: {
                  id: id_proveedor,
                  name: id_proveedor
                },
              });

              const product = await prisma.product.upsert({
                where: { id: id_producto },
                update: {
                  name: nombre_producto,
                  description: descripcion,
                  price: parseFloat(precio_unitario),
                  category: categoria,
                  picture: '',
                  fragile: es_fragil === 'true',
                },
                create: {
                  id: id_producto,
                  name: nombre_producto,
                  description: descripcion,
                  price: parseFloat(precio_unitario),
                  category: categoria,
                  picture: '',
                  fragile: es_fragil === 'true',
                },
              });

              const providerProduct = await prisma.providerProduct.upsert({
                where: {
                  product_id_provider_id: {
                    product_id: product.id,
                    provider_id: provider.id,
                  },
                },
                update: {
                  product_id: product.id,
                  provider_id: provider.id
                },
                create: {
                  product_id: product.id,
                  provider_id: provider.id,
                },
              });

              const stock = await prisma.stock.upsert({
                where: {
                  product_id_storage_id: {
                    product_id: product.id,
                    storage_id: id_almacen,
                  },
                },
                update: {
                  amount: parseInt(cantidad_stock)
                },
                create: {
                  product_id: product.id,
                  storage_id: id_almacen,
                  amount: parseInt(cantidad_stock),
                },
              });
            } catch (error) {
              console.error('Error processing row:', rowProduct, error);
            }
          });
          Promise.all(productPromises);
          return res.status(200).json({
            success: true,
            status: 200,
            message: 'Products uploaded successfully',
          })
        })
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: 'Error uploading products',
        error: error.message,
      });
    }
  }

  @Get('getProductsByStorage/:id')
  async getProductsByStorage(@Res() res: Response, @Param('id') id: string, @Req() req: Request) {
    // const { message, success } = this.generalService.verifyToken(req, 'getProductsByStorage'); 
    // if (!success) {
    //     return res.status(401).json({
    //         status: false,
    //         code: 401,
    //         message: message
    //     });
    // }
    try {
      const products = await prisma.product.findMany({
        where: {
          stock: {
            some: {
              storage_id: id,
              amount: {
                gt: 0,
              }
            },
          },
        },
        include: {
          stock: {
            where: {
              storage_id: id,
              amount: {
                gt: 0,
              }
            },
            select: {
              amount: true,
              storage_id: true,
            }

          },

        },

      });
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: 'No products found for this storage',
        });
      }
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
}
