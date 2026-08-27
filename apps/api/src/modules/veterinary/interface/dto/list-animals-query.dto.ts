import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { AnimalStatus } from '../../domain/entities/animal.entity';

const ANIMAL_STATUSES: AnimalStatus[] = ['ATIVO', 'VENDIDO', 'MORTO', 'DESCARTADO'];

export class ListAnimalsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ANIMAL_STATUSES)
  status?: AnimalStatus;

  @IsOptional()
  @IsUUID()
  loteId?: string;
}
