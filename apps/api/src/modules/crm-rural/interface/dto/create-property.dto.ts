import { IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

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
}
