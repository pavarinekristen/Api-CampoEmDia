import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** Valores dos campos definidos pelo tenant via POST /custom-fields (entityType=CLIENT). */
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}
