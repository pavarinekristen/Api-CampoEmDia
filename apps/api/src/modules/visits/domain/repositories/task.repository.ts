import { TaskItem } from '../entities/task-item.entity';

export interface TaskRepository {
  create(task: TaskItem): Promise<TaskItem & { id: string }>;
  findByVisitId(visitId: string): Promise<Array<TaskItem & { id: string }>>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');
