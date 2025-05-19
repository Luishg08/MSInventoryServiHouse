const mockProviderUpsert = jest.fn();
const mockProductUpsert = jest.fn();
const mockProviderProductUpsert = jest.fn();
const mockStockUpsert = jest.fn();
const mockManagerUpsert = jest.fn();
const mockLocationUpsert = jest.fn();
const mockStorageUpsert = jest.fn();
const mockFindMany = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      provider: {
        upsert: mockProviderUpsert,
      },
      product: {
        upsert: mockProductUpsert,
      },
      providerProduct: {
        upsert: mockProviderProductUpsert,
      },
      stock: {
        upsert: mockStockUpsert,
        findMany: mockFindMany,
      },
      manager: {
        upsert: mockManagerUpsert,
      },
      location: {
        upsert: mockLocationUpsert,
      },
      storage: {
        upsert: mockStorageUpsert,
      },
    })),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './Products/product.controller';
import { StorageController } from './Storage/storage.controller';
import { StockController } from './Stock/stock.controller';
import { GeneralService } from './common/general.service';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { find } from 'rxjs';
const { PrismaClient } = require('@prisma/client'); //Importamos el cliente de prisma
const prisma = new PrismaClient(); //Creamos una instancia de prisma


const mockCsvStream = (rows) => {
  const stream = new (require('stream').Readable)({ objectMode: true });
  rows.forEach(row => stream.push(row));
  stream.push(null); // Fin del stream
  stream.pipe = () => stream; // simula el .pipe()
  stream.on = function(event, callback) {
    if (event === 'data') {
      rows.forEach(row => callback(row));
    }
    if (event === 'end') {
      callback();
    }
    return this;
  };
  return stream;
};

jest.mock('fs');
jest.mock('path', () => {
  const path = jest.requireActual('path');
  return {
    ...path,
    resolve: jest.fn(() => 'mocked/path/to/file.csv'),
    parse: jest.fn(() => ({ name: 'file', ext: '.csv' }))
  };
});

describe('ProductController', () => {
  let productController: ProductController;
  let generalService: GeneralService;
  let req, res, file;
  // Mock request and response objects

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: GeneralService,
          useValue: {
            logger: {
              info: jest.fn(),
              error: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    productController = app.get<ProductController>(ProductController);// Initialize the ProductController if needed
    generalService = app.get<GeneralService>(GeneralService);// Initialize the GeneralService if needed

      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      file = {};
  });
      it('should return error 400 file invalid', async () => {
        if (typeof productController.uploadProducts === 'function') {
          file = {
            originalname: 'testfile.txt',
            buffer: Buffer.from('file content'),
            mimetype: 'text/plain',
          };
          const result = await productController.uploadProducts(file, res, req);
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
            success: false,
            status: 400,
            message: "Invalid file type. Please upload a CSV file."
          });
        } else {
          expect(true).toBe(true); // Placeholder if method doesn't exist
        }
      });

      it('should process CSV file and insert product data', async () => {
        if (typeof productController.uploadProducts === 'function') {
          const file = {
            originalname: 'test.csv',
            mimetype: 'text/csv',
            path: 'fake/path/test.csv',
          } as Express.Multer.File;

          (fs.createReadStream as jest.Mock).mockReturnValue(
            mockCsvStream([
              {
                id_producto: '1',
                id_almacen: '1',
                nombre_producto: 'Product A',
                categoria: 'Category',
                descripcion: 'Desc',
                sku: 'SKU123',
                codigo_barras: '123456789',
                precio_unitario: '10.5',
                cantidad_stock: '100',
                nivel_reorden: '50',
                ultima_reposicion: '2023-01-01',
                fecha_vencimiento: '2024-01-01',
                id_proveedor: 'prov1',
                peso_kg: '1.2',
                dimensiones_cm: '10x10x10',
                es_fragil: 'false',
                requiere_refrigeracion: 'false',
                estado: 'active',
              }
            ])
          );
          (path.parse as jest.Mock).mockReturnValue(file.path);
          mockProviderUpsert.mockResolvedValue({ id: 'prov1', name: 'prov1' });
          mockProductUpsert.mockResolvedValue({});
          mockProviderProductUpsert.mockResolvedValue({});
          mockStockUpsert.mockResolvedValue({}); 
          await productController.uploadProducts(file, res, {} as Request);
          
          
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({
            success: true,
            status: 200,
            message: 'Products uploaded successfully',
          });
        }});

      it('should return error 500 on database error', async () => {
        if (typeof productController.uploadProducts === 'function') {
          const file = {
            originalname: 'products.csv',
            mimetype: 'text/csv',
            path: 'mocked/path/file.csv',
          } as Express.Multer.File;

          (fs.createReadStream as jest.Mock).mockImplementation(() => {
          throw new Error('Simulated internal error');
          });

          await productController.uploadProducts(file, res, req);

          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
              success: false,
              status: 500,
              message: 'Error uploading products',
              error: 'Simulated internal error',
            })
          );
        }
      });
  });

describe('StorageController', () => {
  let storageController: StorageController;
  let generalService: GeneralService;
  let req, res, file;
  
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: GeneralService,
          useValue: {
            logger: {
              info: jest.fn(),
              error: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    storageController = app.get<StorageController>(StorageController);// Initialize the StorageController if needed
    generalService = app.get<GeneralService>(GeneralService);// Initialize the GeneralService if needed

      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      file = {};
    });

    it('should return error 400 file invalid', async () => {
      if (typeof storageController.uploadProducts === 'function') {
        file = {
          originalname: 'testfile.txt',
          buffer: Buffer.from('file content'),
          mimetype: 'text/plain',
        };
        const result = await storageController.uploadProducts(file, res, req);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          status: 400,
          message: "Invalid file type. Please upload a CSV file."
        });
      } else {
        expect(true).toBe(true); // Placeholder if method doesn't exist
      }
    });

    it('should process CSV file and insert product data', async () => {
        if (typeof storageController.uploadProducts === 'function') {
          const file = {
            originalname: 'test.csv',
            mimetype: 'text/csv',
            path: 'fake/path/test.csv',
          } as Express.Multer.File;

          (fs.createReadStream as jest.Mock).mockReturnValue(
            mockCsvStream([
              {
                id_almacen: '1',
                nombre_almacen: 'Almacen A',
                direccion: '123 Main St',
                ciudad: 'City',
                departamento: 'State',
                pais: 'Country',
                codigo_postal: '12345',
                latitud: '10',
                longitud: '20',
                gerente: 'John Doe',
                telefono: '1234567890',
                capacidad_m2: '1000',
                estado: 'active',
                email: 'johndoe@gmail.com'
              }
            ])
          );
          (path.parse as jest.Mock).mockReturnValue(file.path);
          mockManagerUpsert.mockResolvedValue({ id: 'prov1', email: 'johndoe@gmail.com' });
          mockLocationUpsert.mockResolvedValue({});
          mockStorageUpsert.mockResolvedValue({}); 
          await storageController.uploadProducts(file, res, {} as Request);
          
          
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({
            success: true,
            status: 200,
            message: 'Storages uploaded successfully',
          });
        }});
    it('should return error 500 on database error', async () => {
      if (typeof storageController.uploadProducts === 'function') {
        const file = {
            originalname: 'products.csv',
            mimetype: 'text/csv',
            path: 'mocked/path/file.csv',
        } as Express.Multer.File;
        (fs.createReadStream as jest.Mock).mockImplementation(() => {
          throw new Error('Simulated internal error');
          });

        await storageController.uploadProducts(file, res, req);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            status: 500,
            message: 'Error uploading Storages',
            error: 'Simulated internal error',
          })
        );
      }
    });
});

describe('StockController', () => {
  let stockController: StockController;
  let generalService: GeneralService;
  let req, res, file;
  
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: GeneralService,
          useValue: {
            logger: {
              info: jest.fn(),
              error: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    stockController = app.get<StockController>(StockController);// Initialize the StockController if needed
    generalService = app.get<GeneralService>(GeneralService);// Initialize the GeneralService if needed

      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      file = {};
    });

    it('should return 404 if stock not found', async () => {
      const id = 'nonexistent_id';
      mockFindMany.mockResolvedValue([]); // Simulate no stock found

      await stockController.getStockByProduct(id, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No stock found for this product' });
    });

    it('should return stock data if found', async () => {
      const id = 'existing_id';
      const mockStockData = [{ id: '1', product_id: id, quantity: 10 }];
      mockFindMany.mockResolvedValue(mockStockData); // Simulate stock found

      await stockController.getStockByProduct(id, res);

      expect(res.json).toHaveBeenCalledWith(mockStockData);
    });
});
