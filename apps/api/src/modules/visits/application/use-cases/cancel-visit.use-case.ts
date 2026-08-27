import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

@Injectable()
export class CancelVisitUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(visitId: string) {
    const visit = await this.visits.findById(visitId);
    if (!visit) {
      throw new NotFoundException('Visita não encontrada.');
    }

    const cancelled = visit.cancel();
    const saved = await this.visits.save(Object.assign(cancelled, { id: visit.id }));

    // Diferente de EndVisitUseCase: cancelamento não gera relatório —
    // a visita não aconteceu de fato, não há o que documentar.
    await this.auditLog.record({ entity: 'Visit', entityId: saved.id, action: 'CANCEL' });
    return saved;
  }
}
