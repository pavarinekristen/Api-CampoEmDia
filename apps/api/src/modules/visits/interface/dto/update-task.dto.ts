import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { TaskPriority, TaskStatus } from '../../domain/entities/task-item.entity';

const TASK_PRIORITIES: TaskPriority[] = ['BAIXA', 'MEDIA', 'ALTA'];
const TASK_STATUSES: TaskStatus[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'ATRASADA', 'CANCELADA'];

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

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
  @IsEnum(TASK_STATUSES)
  status?: TaskStatus;

  @IsOptional()
  @IsBoolean()
  requiresReturnVisit?: boolean;

  @IsOptional()
  @IsString()
  evidenceExpected?: string;
}
