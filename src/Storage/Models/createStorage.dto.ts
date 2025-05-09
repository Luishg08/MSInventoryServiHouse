import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class createStorageDto {
  @IsString()
  @IsNotEmpty()
  name : string;

  @IsNumber()
  @IsNotEmpty()
  admin_id : number;

  @IsNumber()
  @IsNotEmpty()
  location_id : number;

}
