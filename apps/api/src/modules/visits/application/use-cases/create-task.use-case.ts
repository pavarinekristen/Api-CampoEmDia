import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskItem, TaskPriority } from '../../domain/entities/task-item.entity';
import { TASK_REPOSITORY, TaskRepository } from '../../domain/repositories/task.repository';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';

export interface CreateTaskInput {
  clientGeneratedId: string;
  visitId: string;
  description: string;
  assigneeId?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  requiresReturnVisit?: boolean;
  evidenceExpected?: string;
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
    @Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository,
  ) {}

  async execute(input: CreateTaskInput) {
    const visit = await this.visits.findById(input.visitId);
    if (!visit) {
      throw new NotFoundException('Visita não encontrada.');
    }
    const task = TaskItem.create(input);
    return this.tasks.create(task);
  }
}
