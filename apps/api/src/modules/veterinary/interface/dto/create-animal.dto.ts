import { IsDateString, IsEnum, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { AnimalSex } from '../../domain/entities/animal.entity';

const ANIMAL_SEXES: AnimalSex[] = ['MACHO', 'FEMEA'];

export class CreateAnimalDto {
  @IsOptional()
  @IsUUID()
  loteId?: string;

  @IsString()
  @MinLength(1)
  identifier!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @MinLength(2)
  species!: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsEnum(ANIMAL_SEXES)
  sex?: AnimalSex;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  /** Valores dos campos definidos pelo tenant via POST /custom-fields (entityType=ANIMAL). */
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}
