import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { VisitStatus } from '../../domain/entities/visit.entity';

const VISIT_STATUSES: VisitStatus[] = ['EM_ANDAMENTO', 'ENCERRADA', 'CANCELADA'];

export class ListVisitsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsEnum(VISIT_STATUSES)
  status?: VisitStatus;
}
