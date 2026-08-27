import { IsDateString, IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';
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

  /**
   * Valores dos campos definidos pelo tenant via POST /custom-fields
   * (entityType=VISIT). Só aceito na criação — visita é imutável fora das
   * transições explícitas (end/cancel), sem endpoint de edição genérica.
   */
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}
