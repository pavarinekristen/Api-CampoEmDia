import { IsNumber, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreatePropertyDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  activities?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  /** Valores dos campos definidos pelo tenant via POST /custom-fields (entityType=PROPERTY). */
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}
