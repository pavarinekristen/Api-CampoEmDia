import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PROPERTY_REPOSITORY,
  PropertyRepository,
  UpdatePropertyPatch,
} from '../../domain/repositories/property.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface UpdatePropertyInput extends UpdatePropertyPatch {
  propertyId: string;
  version?: number;
}

@Injectable()
export class UpdatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdatePropertyInput) {
    const existing = await this.properties.findById(input.propertyId);
    if (!existing) {
      throw new NotFoundException('Propriedade não encontrada.');
    }

    const { propertyId, version, ...patch } = input;
    const result = await this.properties.update(propertyId, patch, version);
    if (result === 'CONFLICT') {
      throw new ConflictException('A propriedade foi alterada por outra sessão — recarregue e tente novamente.');
    }

    await this.auditLog.record({ entity: 'Property', entityId: result.id, action: 'UPDATE', diff: patch });
    return result;
  }
}
