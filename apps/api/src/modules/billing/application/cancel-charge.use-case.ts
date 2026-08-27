import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AuditLogService } from '../../../infra/audit/audit-log.service';

@Injectable()
export class CancelChargeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(chargeId: string) {
    const existing = await this.prisma.serviceCharge.findUnique({ where: { id: chargeId } });
    if (!existing) {
      throw new NotFoundException('Cobrança não encontrada.');
    }
    if (existing.status === 'CANCELADO') {
      throw new BadRequestException('Esta cobrança já está cancelada.');
    }

    const updated = await this.prisma.serviceCharge.update({ where: { id: chargeId }, data: { status: 'CANCELADO' } });
    await this.auditLog.record({ entity: 'ServiceCharge', entityId: updated.id, action: 'CANCEL' });
    return updated;
  }
}
