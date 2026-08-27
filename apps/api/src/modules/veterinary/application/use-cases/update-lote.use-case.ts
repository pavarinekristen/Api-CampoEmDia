import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOTE_REPOSITORY, LoteRepository } from '../../domain/repositories/lote.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface UpdateLoteInput {
  loteId: string;
  name?: string;
  description?: string;
}

@Injectable()
export class UpdateLoteUseCase {
  constructor(
    @Inject(LOTE_REPOSITORY) private readonly lotes: LoteRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdateLoteInput) {
    const existing = await this.lotes.findById(input.loteId);
    if (!existing) {
      throw new NotFoundException('Lote não encontrado.');
    }

    const updated = await this.lotes.update(
      Object.assign(existing.update({ name: input.name, description: input.description }), { id: existing.id }),
    );

    await this.auditLog.record({ entity: 'Lote', entityId: updated.id, action: 'UPDATE' });
    return updated;
  }
}
