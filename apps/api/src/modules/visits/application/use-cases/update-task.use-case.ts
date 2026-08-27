import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TASK_REPOSITORY, TaskRepository, UpdateTaskPatch } from '../../domain/repositories/task.repository';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface UpdateTaskInput extends UpdateTaskPatch {
  visitId: string;
  taskId: string;
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
    @Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdateTaskInput) {
    const visit = await this.visits.findById(input.visitId);
    if (!visit) {
      throw new NotFoundException('Visita não encontrada.');
    }
    if (visit.status === 'CANCELADA') {
      throw new BadRequestException('Não é possível editar tarefas de uma visita cancelada.');
    }

    const task = await this.tasks.findById(input.taskId);
    if (!task || task.visitId !== input.visitId) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    const { visitId, taskId, ...patch } = input;
    // Valida a transição pela entidade de domínio antes de persistir —
    // TaskItem.update() já rejeita descrição vazia, por exemplo.
    task.update(patch);

    const updated = await this.tasks.update(taskId, patch);
    await this.auditLog.record({ entity: 'TaskItem', entityId: updated.id, action: 'UPDATE', diff: patch });
    return updated;
  }
}
