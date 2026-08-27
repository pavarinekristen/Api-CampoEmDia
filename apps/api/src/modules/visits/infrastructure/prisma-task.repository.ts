import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { TaskItem } from '../domain/entities/task-item.entity';
import { TaskRepository } from '../domain/repositories/task.repository';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(task: TaskItem): Promise<TaskItem & { id: string }> {
    // tenantId explícito para satisfazer o tipo do Prisma — o middleware de
    // tenant confirma/sobrescreve com o mesmo valor em runtime.
    const created = await this.prisma.taskItem.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        clientGeneratedId: task.clientGeneratedId,
        visitId: task.visitId,
        description: task.description,
        assigneeId: task.assigneeId ?? undefined,
        dueDate: task.dueDate ?? undefined,
        priority: task.priority,
        status: task.status,
        requiresReturnVisit: task.requiresReturnVisit,
        evidenceExpected: task.evidenceExpected ?? undefined,
      },
    });
    return Object.assign(task, { id: created.id });
  }

  async findByVisitId(visitId: string): Promise<Array<TaskItem & { id: string }>> {
    const rows = await this.prisma.taskItem.findMany({ where: { visitId }, orderBy: { createdAt: 'asc' } });
    return rows.map((row) =>
      Object.assign(
        TaskItem.create({
          clientGeneratedId: row.clientGeneratedId,
          visitId: row.visitId,
          description: row.description,
          assigneeId: row.assigneeId ?? undefined,
          dueDate: row.dueDate ?? undefined,
          priority: row.priority,
          requiresReturnVisit: row.requiresReturnVisit,
          evidenceExpected: row.evidenceExpected ?? undefined,
        }),
        { id: row.id },
      ),
    );
  }
}
