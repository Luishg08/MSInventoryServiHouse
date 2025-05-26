import { Body, Controller, Get, Res, Post, ValidationPipe, Param, Put, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
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

@Controller('stock')
export class StockController {
    @Get('stockByProduct/:id')
    async getStockByProduct(@Param('id') id: string, @Res() res: Response) {
        const stock = await prisma.stock.findMany({
            where: {
                product_id: id
            }
        });
        if (stock.length === 0) {
            return res.status(404).json({ message: 'No stock found for this product' });
        }
        return res.json(stock);
    }
    @Get('stockByStorage/:id')
    async getStockByStorage(@Param('id') id: string, @Res() res: Response) {
        const stock = await prisma.stock.findMany({
            where: {
                storage_id: id
            }
        });
        if (stock.length === 0) {
            return res.status(404).json({ message: 'No stock found for this storage' });
        }
        return res.json(stock);
    }

    @Get('stockTransactions')
    async getStockTransactions(@Res() res: Response) {
        const stock = await prisma.stock.findMany({
            include: {
                product: true,
                storage: true
            }
        });
        if (stock.length === 0) {
            return res.status(404).json({ message: 'No stock found' });
        }
        return res.json(stock);
    }
    @Get('verify-stock/:product_id/:storage_id/:amount')
    async verifyStock(
        @Res() res: Response,
        @Param('product_id') product_id: string,
        @Param('storage_id') storage_id: string,
        @Param('amount') amount: string
    ) {
        const requestedAmount = parseInt(amount, 10);
        const stock = await prisma.stock.findFirst({
            where: {
                product_id,
                storage_id,
            },
        });

        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'No stock found for this product in this storage'
            });
        }

        if (requestedAmount > stock.amount) {
            return res.status(400).json({
                success: false,
                message: `Requested amount exceeds available stock. Available: ${stock.amount}`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Requested amount is available',
            available: stock.amount
        });
    }
}