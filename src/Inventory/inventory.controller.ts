const { PrismaClient } = require('@prisma/client'); //Importamos el cliente de prisma
const prisma = new PrismaClient(); //Creamos una instancia de prisma
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { stat } from 'fs';
const { Readable } = require('stream'); 
const csv = require('csv-parser');
import { Module } from '@nestjs/common';
import { GeneralInventoryModule } from './inventory.module';
import * as Papa from 'papaparse';



@Controller('GeneralInventory')
export class GeneralInventoryController {
  @Post('uploadInventory')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInventory(
    @UploadedFile() file: Express.Multer.File
  )
  {
    if (!file || file.mimetype !== 'text/csv') {
      return {
        success: false,
        status: 400,
        message: 'File is required and must be a CSV file',
      };
    }
    const stream = Readable.from(file.buffer);
    const inventoryData = [];
    let currentSection = 'storage';
    

   stream
      .pipe(csv({ separator: ';'}))
      .on('data', (row) => {
        const rowStr = Object.values(row).join('').trim();

        if (rowStr === '' || rowStr.includes(';;;;;;;;;;;;;;;')) {
          currentSection = currentSection === 'storage' ? 'product' : 'storage';
          return;
        }
        if (currentSection === 'storage') {
          inventoryData.push({ section: 'storage', data: row });
        } else if (currentSection === 'product') {
          inventoryData.push({ section: 'product', data: row });
        }
      })
      .on('end', async () => {
        const storageData = inventoryData
          .filter((item) => item.section === 'storage')
          .map((item) => item.data);
        const productData = inventoryData
          .filter((item) => item.section === 'product')
          .map((item) => item.data);
        // const storagePromises = await storageData.map(async (row) => {
        //   try {        
        //     const {
        //       id_almacen,
        //       nombre_almacen,
        //       direccion,
        //       ciudad,
        //       departamento,
        //       pais,
        //       codigo_postal,
        //       latitud,
        //       longitud,
        //       gerente,
        //       telefono,
        //       capacidad_m2,
        //       estado,
        //       email,
        //     } = row;
      
        //     const manager = await prisma.manager.upsert({
        //       where: { email },
        //       update: {
        //         full_name: gerente,
        //         email,
        //         phone: telefono,
        //         user_id: '',
        //         state: 'ACT',
        //       },
        //       create: {
        //         full_name: gerente,
        //         email,
        //         phone: telefono,
        //         user_id: '',
        //         state: 'ACT',
        //       },
        //     });        
        //     const location = await prisma.location.upsert({
        //       where: {
        //         latitude_altitude: {
        //         latitude: latitud.toString(),
        //         altitude: longitud.toString(),
        //       }},
        //       update: {
        //       static: true,
        //       address: direccion,
        //       city: ciudad,
        //       department: departamento,
        //       },
        //       create: {
        //       latitude: latitud.toString(),
        //       altitude: longitud.toString(),
        //       static: true,
        //       address: direccion,
        //       city: ciudad,
        //       department: departamento,
        //       },
        //     });        
        //     const storage = await prisma.storage.upsert({
        //       where: { id: id_almacen },
        //       update: {
        //         name: nombre_almacen,
        //         manager_id: manager.id,
        //         location_id: location.id,
        //         capacity: parseInt(capacidad_m2),
        //       },
        //       create: {
        //         id: id_almacen,
        //         name: nombre_almacen,
        //         manager_id: manager.id,
        //         location_id: location.id,
        //         capacity: parseInt(capacidad_m2),
        //       },
        //     });
        
        //   } catch (error) {
        //     console.error('Error processing row:', row, error);
        //   }
        // });
         const productPromises = productData.map(async (rowProduct) => {
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
            } = rowProduct;
      
            const provider = await prisma.provider.upsert({
              where: { id: capacidad_m2 },
              update: {
                name: capacidad_m2
              },
              create: {
                id: capacidad_m2,
                name: capacidad_m2
              },
            });        
            
            const product = await prisma.product.upsert({
              where: { id: id_almacen },
              update: {
                name: direccion ,
                description: departamento,
                price: parseFloat(latitud),
                category: ciudad,
                picture: ''
              },
              create: {
                id: id_almacen,
                name: direccion ,
                description: departamento,
                price: parseFloat(latitud),
                category: ciudad,
                picture: '',
                fragile: false,
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
                  storage_id: nombre_almacen,
                },
               },
              update: {
                amount: parseInt(longitud)
              },
              create: {
                product_id: product.id,
                storage_id: nombre_almacen,
                amount: parseInt(longitud),
              },
            });
        
          } catch (error) {
            console.error('Error processing row:', rowProduct, error);
          }
        });
  
        return {
          success: true,
          status: 200,
          message: 'Inventory uploaded successfully',
        };
        })
        
 }

//  @Post('uploadInventory2')
// @UseInterceptors(FileInterceptor('file'))
// async uploadInventory2(@UploadedFile() file: Express.Multer.File) {
//   if (!file || file.mimetype !== 'text/csv') {
//     return {
//       success: false,
//       status: 400,
//       message: 'File is required and must be a CSV file',
//     };
//   }

//   const content = file.buffer.toString('utf-8');
//   const [storageSection, productSection] = content.split(';;;;;;;;;;;;;;;;;\n');

//   const parseCSV = async (csvContent: string): Promise<Record<string, string>[]> => {
//     const results: Record<string, string>[] = [];
//     const stream = Readable.from(csvContent);
//     return new Promise((resolve, reject) => {
//       stream
//         .pipe(csv({ separator: ';' }))
//         .on('data', (row: Record<string, string>) => results.push(row))
//         .on('end', () => resolve(results))
//         .on('error', reject);
//     });
//   };

//   const storageData = await parseCSV(storageSection);
//   const productData = await parseCSV(productSection);

//   Procesar almacenes
//   await Promise.all(
//     storageData.map(async (row) => {
//       try {
//         const {
//           id_almacen,
//           nombre_almacen,
//           direccion,
//           ciudad,
//           departamento,
//           pais,
//           codigo_postal,
//           latitud,
//           longitud,
//           gerente,
//           telefono,
//           email,
//           capacidad_m2,
//           estado,
//         } = row;

//         const manager = await prisma.manager.upsert({
//           where: { email },
//           update: {
//             full_name: gerente,
//             email,
//             phone: telefono,
//             user_id: '',
//             state: 'ACT',
//           },
//           create: {
//             full_name: gerente,
//             email,
//             phone: telefono,
//             user_id: '',
//             state: 'ACT',
//           },
//         });

//         const location = await prisma.location.upsert({
//           where: {
//             latitude_altitude: {
//               latitude: latitud.toString(),
//               altitude: longitud.toString(),
//             },
//           },
//           update: {
//             static: true,
//             address: direccion,
//             city: ciudad,
//             department: departamento,
//           },
//           create: {
//             latitude: latitud.toString(),
//             altitude: longitud.toString(),
//             static: true,
//             address: direccion,
//             city: ciudad,
//             department: departamento,
//           },
//         });

//         await prisma.storage.upsert({
//           where: { id: id_almacen },
//           update: {
//             name: nombre_almacen,
//             manager_id: manager.id,
//             location_id: location.id,
//             capacity: parseInt(capacidad_m2),
//           },
//           create: {
//             id: id_almacen,
//             name: nombre_almacen,
//             manager_id: manager.id,
//             location_id: location.id,
//             capacity: parseInt(capacidad_m2),
//           },
//         });
//       } catch (error) {
//         console.error('Error processing storage row:', row, error);
//       }
//     }),
//   );

//   Procesar productos
//   await Promise.all(
//     productData.map(async (row) => {
//       try {
//         const {
//           id_producto,
//           id_almacen,
//           nombre_producto,
//           categoria,
//           descripcion,
//           sku,
//           codigo_barras,
//           precio_unitario,
//           cantidad_stock,
//           nivel_reorden,
//           ultima_reposicion,
//           fecha_vencimiento,
//           id_proveedor,
//           peso_kg,
//           dimensiones_cm,
//           es_fragil,
//           requiere_refrigeracion,
//           estado,
//         } = row;

//         const provider = await prisma.provider.upsert({
//           where: { id: id_proveedor },
//           update: { name: id_proveedor },
//           create: { id: id_proveedor, name: id_proveedor },
//         });

//         const product = await prisma.product.upsert({
//           where: { id: id_producto },
//           update: {
//             name: nombre_producto,
//             description: descripcion,
//             category: categoria,
//             price: parseFloat(precio_unitario),
//             picture: '',
//             fragile: es_fragil === 'true',
//           },
//           create: {
//             id: id_producto,
//             name: nombre_producto,
//             description: descripcion,
//             category: categoria,
//             price: parseFloat(precio_unitario),
//             picture: '',
//             fragile: es_fragil === 'true',
//           },
//         });

//         await prisma.providerProduct.upsert({
//           where: {
//             product_id_provider_id: {
//               product_id: product.id,
//               provider_id: provider.id,
//             },
//           },
//           update: {},
//           create: {
//             product_id: product.id,
//             provider_id: provider.id,
//           },
//         });

//         await prisma.stock.upsert({
//           where: {
//             product_id_storage_id: {
//               product_id: product.id,
//               storage_id: id_almacen,
//             },
//           },
//           update: {
//             amount: parseInt(cantidad_stock),
//             updatedAt: new Date(ultima_reposicion),
//           },
//           create: {
//             product_id: product.id,
//             storage_id: id_almacen,
//             amount: parseInt(cantidad_stock),
//             updatedAt: new Date(ultima_reposicion),
//           },
//         });
//       } catch (error) {
//         console.error('Error processing product row:', row, error);
//       }
//     }),
//   );

//   return {
//     success: true,
//     status: 200,
//     message: 'Inventory uploaded successfully',
//   };
// }

}
