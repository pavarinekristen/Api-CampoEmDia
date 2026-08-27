import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../../domain/repositories/property.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

@Injectable()
export class DeactivatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(id: string) {
    const existing = await this.properties.findById(id);
    if (!existing) {
      throw new NotFoundException('Propriedade não encontrada.');
    }

    await this.properties.softDelete(id);
    await this.auditLog.record({ entity: 'Property', entityId: id, action: 'DEACTIVATE' });
  }
}
