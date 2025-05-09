import { Body, Controller, Get, Res, Post, ValidationPipe, Param, Put, Delete } from '@nestjs/common';
import { createStorageDto } from './Models/createStorage.dto';
const { PrismaClient } = require('@prisma/client'); //Importamos el cliente de prisma
const prisma = new PrismaClient(); //Creamos una instancia de prisma
import { Response } from 'express';


@Controller('storage')
export class StorageController {
@Post('create')
async createStorage(
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }), )
  dto: createStorageDto, @Res() res: Response
) {
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
async getAllStorages(@Res() res: Response) {
  try {
    const storages = await prisma.storage.findMany();
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
async getStorageById(@Res() res: Response, @Param('id') id: string) {
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
  dto: createStorageDto,
) {
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
async deleteStorage(@Res() res: Response, @Param('id') id: string) {
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
}