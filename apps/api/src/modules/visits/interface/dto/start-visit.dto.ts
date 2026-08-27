import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { VisitType } from '../../domain/entities/visit.entity';

const VISIT_TYPES: VisitType[] = [
  'ACOMPANHAMENTO',
  'EMERGENCIA',
  'RETORNO',
  'COLETA',
  'VACINACAO',
  'REPRODUCAO',
  'AVALIACAO_PRODUTIVA',
  'VISTORIA',
  'CONSULTORIA',
];

export class StartVisitDto {
  @IsUUID()
  clientGeneratedId!: string;

  @IsUUID()
  propertyId!: string;

  @IsEnum(VISIT_TYPES)
  type!: VisitType;

  @IsDateString()
  startedAt!: string;
}
