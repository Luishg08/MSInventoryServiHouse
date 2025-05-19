import { Body, Controller, Get, Res, Post, ValidationPipe, Param, Put, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { createStorageDto } from './Models/createStorage.dto';
const { PrismaClient } = require('@prisma/client'); //Importamos el cliente de prisma
const prisma = new PrismaClient(); //Creamos una instancia de prisma
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { GeneralService } from '../common/general.service';
import { log } from 'console';


@Controller('storage')
export class StorageController {
  constructor(private readonly generalService: GeneralService) {}
@Post('create')
async createStorage(
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }), )
  dto: createStorageDto, @Res() res: Response, @Req() req: Request
) {
  const { message, success } = this.generalService.verifyToken(req, 'createStorage'); 
    if (!success) {
        return res.status(401).json({
            status: false,
            code: 401,
            message: message
        });
    }
  try {
    const admin = await prisma.admin.findUnique({
        where: { id: dto.admin_id },
        });
    if (!admin) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: 'Admin not found',
          });
        }
    const location = await prisma.location.findUnique({
        where: { id: dto.location_id },
        });
    if (!location) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: 'Location not found',
          });
      }

    const storage = await prisma.storage.create({
      data: {
        name: dto.name,
        admin_id: dto.admin_id,
        location_id: dto.location_id,
      },
    });
    return {
      success: true,
      status: 201,
      data: storage,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Error creating Storage',
      error: error.message,
    };
  }
}

@Get('getAll')
async getAllStorages(@Res() res: Response, @Req() req: Request) {
  // const { message, success } = this.generalService.verifyToken(req, 'getAllStorages'); 
  //   if (!success) {
  //       return res.status(401).json({
  //           status: false,
  //           code: 401,
  //           message: message
  //       });
  //   }
  try {
    const storages = await prisma.storage.findMany({
      include: {
        manager: {
          select: {
            full_name: true, // solo traes el nombre del manager
          },
        },
        location: {
          select: {
            address: true, // solo traes la direccion de la locacion
            department: true, // solo traes el departamento de la locacion
            city: true, // solo traes la ciudad de la locacion
          },
        },
      }}
    );
    // const newData = storages.map((storage) => {
    //   storage.manager = (prisma.manager.findUnique({
    //     where: { id: storage.manager_id },
    //   })).full_name;
    //   storage.location = (prisma.location.findUnique({
    //     where: { id: storage.location_id }
    //   })).address;
    // });
    return res.status(200).json({
      success: true,
      status: 200,
      data: storages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error fetching storages',
      error: error.message,
    });
  }
}

@Get('getById/:id')
async getStorageById(@Res() res: Response, @Param('id') id: string, @Req() req: Request) {
  const { message, success } = this.generalService.verifyToken(req, 'getStorageById');
    if (!success) {
        return res.status(401).json({
            status: false,
            code: 401,
            message: message
        });
    }
  try {
    const storage = await prisma.storage.findUnique({
      where: { id: Number(id) },
    });
    if (!storage) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Storage not found',
      });
    }
    return res.status(200).json({
      success: true,
      status: 200,
      data: storage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error fetching Sroduct',
      error: error.message,
    });
  }
}

@Put('update/:id')
async updateStorage(
  @Res() res: Response,
  @Param('id') id: string,
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  dto: createStorageDto, @Req() req: Request
) {
  const { message, success } = this.generalService.verifyToken(req, 'updateStorage'); 
    if (!success) {
        return res.status(401).json({
            status: false,
            code: 401,
            message: message
        });
    }
  try {
    const exists  = await prisma.storage.findUnique({
      where: { id: Number(id) },
    });
    if (!exists) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Storage not found',
      });
    }
    const storage = await prisma.storage.update({
      where: { id: Number(id) },
      data: {
        name: dto.name,
        admin_id: dto.admin_id,
        location_id: dto.location_id,
    },
    });
    
    return res.status(200).json({
      success: true,
      status: 200,
      data: storage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error updating storage',
      error: error.message,
    });
  }
}

@Delete('delete/:id')
async deleteStorage(@Res() res: Response, @Param('id') id: string, @Req() req: Request) {
  const { message, success } = this.generalService.verifyToken(req, 'deleteStorage');
    if (!success) {
        return res.status(401).json({
            status: false,
            code: 401,
            message: message
        });
    }
  try {
    const exists  = await prisma.storage.findUnique({
      where: { id: Number(id) },
    });
    if (!exists) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Storage not found',
      });
    }
    await prisma.storage.delete({
      where: { id: Number(id) },
    });
    
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Storage deleted successfully',
      data: exists
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Error deleting Storage',
      error: error.message,
    });
  }
}

@Post('uploadStorages')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); 
        const filename = `storages-${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
  }),
)
  async uploadProducts(
    @UploadedFile() file: Express.Multer.File, @Res() res: Response, @Req() req: Request
  )
  {
    // const { message, success } = this.generalService.verifyToken(req, 'uploadFile');
    // if (!success) {
    //     return res.status(401).json({
    //         status: false,
    //         code: 401,
    //         message: message
    //     });
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
      const storageData = [];
      fileStream
        .pipe(csv({ separator: ';'}))
        .on('data', (row) => {
          const requiredColumns = [
            'id_almacen',
            'nombre_almacen',
            'direccion',
            'ciudad',
            'departamento',
            'pais',
            'codigo_postal',
            'latitud',
            'longitud',
            'gerente',
            'telefono',
            'capacidad_m2',
            'estado',
            'email'
          ];
          const missingColumns = requiredColumns.filter((column) => !row[column]);
          if (missingColumns.length > 0) {
            this.generalService.logger.error(`Missing columns: ${missingColumns.join(', ')} in row: ${JSON.stringify(row)}`);
          }
          else{
            this.generalService.logger.info(`Processing row: ${JSON.stringify(row)}`);
            storageData.push(row);
          }
        })
        .on('end', async () => {
          const storagePromises = await storageData.map(async (row) => {
          try {        
            const {
              id_almacen,
              nombre_almacen,
              direccion,
              ciudad,
              departamento,
              pais,
              codigo_postal,
              latitud,
              longitud,
              gerente,
              telefono,
              capacidad_m2,
              estado,
              email,
            } = row;
      
            const manager = await prisma.manager.upsert({
              where: { email },
              update: {
                full_name: gerente,
                email,
                phone: telefono,
                user_id: '',
                state: 'ACT',
              },
              create: {
                full_name: gerente,
                email,
                phone: telefono,
                user_id: '',
                state: 'ACT',
              },
            });        
            const location = await prisma.location.upsert({
              where: {
                latitude_altitude: {
                latitude: latitud.toString(),
                altitude: longitud.toString(),
              }},
              update: {
              static: true,
              address: direccion,
              city: ciudad,
              department: departamento,
              },
              create: {
              latitude: latitud.toString(),
              altitude: longitud.toString(),
              static: true,
              address: direccion,
              city: ciudad,
              department: departamento,
              },
            });        
            const storage = await prisma.storage.upsert({
              where: { id: id_almacen },
              update: {
                name: nombre_almacen,
                manager_id: manager.id,
                location_id: location.id,
                capacity: parseInt(capacidad_m2),
              },
              create: {
                id: id_almacen,
                name: nombre_almacen,
                manager_id: manager.id,
                location_id: location.id,
                capacity: parseInt(capacidad_m2),
              },
            });
        
          } catch (error) {
            console.error('Error processing row:', row, error);
            this.generalService.logger.error(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
          }
        });
          Promise.all(storagePromises);
          return res.status(200).json({
            success: true,
            status: 200,
            message: 'Storages uploaded successfully',
          })
        })
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: 'Error uploading Storages',
        error: error.message,
      });
    }
  }

}