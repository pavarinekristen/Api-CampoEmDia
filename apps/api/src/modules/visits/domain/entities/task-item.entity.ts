export type TaskPriority = 'BAIXA' | 'MEDIA' | 'ALTA';
export type TaskStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA' | 'CANCELADA';

export class TaskItem {
  private constructor(
    readonly id: string | undefined,
    readonly clientGeneratedId: string,
    readonly visitId: string,
    readonly description: string,
    readonly assigneeId: string | null,
    readonly dueDate: Date | null,
    readonly priority: TaskPriority,
    readonly status: TaskStatus,
    readonly requiresReturnVisit: boolean,
    readonly evidenceExpected: string | null,
  ) {}

  static create(params: {
    clientGeneratedId: string;
    visitId: string;
    description: string;
    assigneeId?: string;
    dueDate?: Date;
    priority?: TaskPriority;
    requiresReturnVisit?: boolean;
    evidenceExpected?: string;
  }): TaskItem {
    if (params.description.trim().length < 2) {
      throw new Error('Descrição da tarefa é obrigatória.');
    }
    return new TaskItem(
      undefined,
      params.clientGeneratedId,
      params.visitId,
      params.description.trim(),
      params.assigneeId ?? null,
      params.dueDate ?? null,
      params.priority ?? 'MEDIA',
      'PENDENTE',
      params.requiresReturnVisit ?? false,
      params.evidenceExpected ?? null,
    );
  }
}
