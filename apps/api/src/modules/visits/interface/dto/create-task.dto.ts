import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { TaskPriority } from '../../domain/entities/task-item.entity';

const TASK_PRIORITIES: TaskPriority[] = ['BAIXA', 'MEDIA', 'ALTA'];

export class CreateTaskDto {
  @IsUUID()
  clientGeneratedId!: string;

  @IsUUID()
  visitId!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TASK_PRIORITIES)
  priority?: TaskPriority;

  @IsOptional()
  @IsBoolean()
  requiresReturnVisit?: boolean;

  @IsOptional()
  @IsString()
  evidenceExpected?: string;
}
