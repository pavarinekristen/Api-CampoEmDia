import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { tenantContext } from '../../common/context/tenant-context';

export interface RecordAuditLogInput {
  entity: string; // ex: "Client", "Visit", "TaskItem"
  entityId: string;
  action: string; // ex: "CREATE", "UPDATE", "DEACTIVATE", "CANCEL", "MARK_PAID"
  diff?: Record<string, unknown>;
}

/**
 * Grava o log de auditoria (model `AuditLog`, já previsto no schema desde
 * o MVP como "registro de alterações relevantes", mas nunca escrito até
 * este ponto). Toda use-case de update/soft-delete/transição de status
 * deve chamar isto no fim da operação.
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditLogInput): Promise<void> {
    const ctx = tenantContext.getOrThrow();
    await this.prisma.auditLog.create({
      data: {
        tenantId: ctx.tenantId,
        entity: input.entity,
        entityId: input.entityId,
        action: input.action,
        actorId: ctx.userId,
        diff: (input.diff as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }
}
