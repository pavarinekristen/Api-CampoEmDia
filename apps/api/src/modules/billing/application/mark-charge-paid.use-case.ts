import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AuditLogService } from '../../../infra/audit/audit-log.service';

@Injectable()
export class MarkChargePaidUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(chargeId: string) {
    const existing = await this.prisma.serviceCharge.findUnique({ where: { id: chargeId } });
    if (!existing) {
      throw new NotFoundException('Cobrança não encontrada.');
    }
    if (existing.status !== 'PENDENTE') {
      throw new BadRequestException(`Não é possível marcar como paga uma cobrança com status "${existing.status}".`);
    }

    const updated = await this.prisma.serviceCharge.update({ where: { id: chargeId }, data: { status: 'PAGO' } });
    await this.auditLog.record({ entity: 'ServiceCharge', entityId: updated.id, action: 'MARK_PAID' });
    return updated;
  }
}
