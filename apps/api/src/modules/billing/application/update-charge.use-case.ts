import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AuditLogService } from '../../../infra/audit/audit-log.service';

export interface UpdateChargeInput {
  chargeId: string;
  description?: string;
  amountCents?: number;
  dueDate?: Date;
}

@Injectable()
export class UpdateChargeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdateChargeInput) {
    const existing = await this.prisma.serviceCharge.findUnique({ where: { id: input.chargeId } });
    if (!existing) {
      throw new NotFoundException('Cobrança não encontrada.');
    }
    if (existing.status !== 'PENDENTE') {
      throw new BadRequestException('Só é possível editar uma cobrança enquanto ela está pendente.');
    }

    const { chargeId, ...patch } = input;
    const updated = await this.prisma.serviceCharge.update({ where: { id: chargeId }, data: patch });

    await this.auditLog.record({ entity: 'ServiceCharge', entityId: updated.id, action: 'UPDATE', diff: patch });
    return updated;
  }
}
