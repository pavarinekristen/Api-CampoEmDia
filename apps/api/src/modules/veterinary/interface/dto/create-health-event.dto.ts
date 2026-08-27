import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { HealthEventType, PregnancyStatus } from '../../domain/entities/animal-health-event.entity';

const HEALTH_EVENT_TYPES: HealthEventType[] = ['VACINACAO', 'MEDICAMENTO', 'EXAME', 'PROCEDIMENTO', 'REPRODUCAO'];
const PREGNANCY_STATUSES: PregnancyStatus[] = ['NAO_CONFIRMADA', 'CONFIRMADA', 'PERDIDA'];

export class CreateHealthEventDto {
  @IsOptional()
  @IsUUID()
  visitId?: string;

  @IsEnum(HEALTH_EVENT_TYPES)
  type!: HealthEventType;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  doseInfo?: string;

  @IsOptional()
  @IsUUID()
  appliedById?: string;

  @IsDateString()
  appliedAt!: string;

  @IsOptional()
  @IsDateString()
  withdrawalUntil?: string;

  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @IsOptional()
  @IsEnum(PREGNANCY_STATUSES)
  pregnancyStatus?: PregnancyStatus;

  @IsOptional()
  @IsDateString()
  expectedBirthDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
