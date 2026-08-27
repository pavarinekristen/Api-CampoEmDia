import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AnimalStatus } from '../../domain/entities/animal.entity';

const NON_ATIVO_STATUSES: Array<Exclude<AnimalStatus, 'ATIVO'>> = ['VENDIDO', 'MORTO', 'DESCARTADO'];

export class ChangeAnimalStatusDto {
  @IsEnum(NON_ATIVO_STATUSES)
  status!: Exclude<AnimalStatus, 'ATIVO'>;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsDateString()
  at!: string;
}
