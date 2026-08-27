import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Lote } from '../../domain/entities/lote.entity';
import { LOTE_REPOSITORY, LoteRepository } from '../../domain/repositories/lote.repository';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../../../crm-rural/domain/repositories/property.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface CreateLoteInput {
  propertyId: string;
  name: string;
  description?: string;
}

@Injectable()
export class CreateLoteUseCase {
  constructor(
    @Inject(LOTE_REPOSITORY) private readonly lotes: LoteRepository,
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: CreateLoteInput) {
    const property = await this.properties.findById(input.propertyId);
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada.');
    }

    const lote = Lote.create(input);
    const created = await this.lotes.create(lote);

    await this.auditLog.record({ entity: 'Lote', entityId: created.id, action: 'CREATE' });
    return created;
  }
}
