import { Controller, Get } from '@nestjs/common';

@Controller('inventoryTest')
export class inventoryTestController {
  @Get('test')
  test(): string {
    return JSON.stringify({
      message: 'Hello from MSInventory',
      status: 'OK',
    });
  }
}
