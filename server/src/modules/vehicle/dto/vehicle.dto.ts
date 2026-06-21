import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateVehicleDto {
  @IsOptional() @IsString() plateNumber?: string;
  @IsString() @IsNotEmpty() model: string;
  @IsOptional() @IsNumber() capacity?: number;
  @IsOptional() @IsNumber() fuelConsumption?: number;
  @IsString() @IsNotEmpty() ownerId: string;
}

export class UpdateVehicleDto {
  @IsOptional() @IsString() plateNumber?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsNumber() capacity?: number;
  @IsOptional() @IsNumber() fuelConsumption?: number;
}

export class CreateFuelSubsidyDto {
  @IsString() @IsNotEmpty() vehicleId: string;
  @IsDateString() fuelDate: string;
  @IsNumber() fuelAmount: number;
  @IsNumber() fuelPrice: number;
  @IsNumber() totalAmount: number;
  @IsOptional() @IsBoolean() isSplit?: boolean;
  @IsOptional() @IsString() note?: string;
}
