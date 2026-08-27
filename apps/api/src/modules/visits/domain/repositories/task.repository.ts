import { TaskItem, TaskPriority, TaskStatus } from '../entities/task-item.entity';

export interface UpdateTaskPatch {
  description?: string;
  assigneeId?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  requiresReturnVisit?: boolean;
  evidenceExpected?: string;
}

export interface TaskRepository {
  create(task: TaskItem): Promise<TaskItem & { id: string }>;
  findByVisitId(visitId: string): Promise<Array<TaskItem & { id: string }>>;
  findById(id: string): Promise<(TaskItem & { id: string }) | null>;
  update(id: string, patch: UpdateTaskPatch): Promise<TaskItem & { id: string }>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');
