import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { TaskItem } from '../domain/entities/task-item.entity';
import { TaskRepository, UpdateTaskPatch } from '../domain/repositories/task.repository';

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
    return TaskItem.fromPersistence(created);
  }

  async findByVisitId(visitId: string): Promise<Array<TaskItem & { id: string }>> {
    const rows = await this.prisma.taskItem.findMany({ where: { visitId }, orderBy: { createdAt: 'asc' } });
    return rows.map((row) => TaskItem.fromPersistence(row));
  }

  async findById(id: string): Promise<(TaskItem & { id: string }) | null> {
    const row = await this.prisma.taskItem.findUnique({ where: { id } });
    return row ? TaskItem.fromPersistence(row) : null;
  }

  async update(id: string, patch: UpdateTaskPatch): Promise<TaskItem & { id: string }> {
    const updated = await this.prisma.taskItem.update({ where: { id }, data: patch });
    return TaskItem.fromPersistence(updated);
  }
}
