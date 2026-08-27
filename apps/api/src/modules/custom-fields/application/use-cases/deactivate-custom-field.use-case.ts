import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';
import {
  CUSTOM_FIELD_DEFINITION_REPOSITORY,
  CustomFieldDefinitionRepository,
} from '../../domain/repositories/custom-field-definition.repository';

@Injectable()
export class DeactivateCustomFieldUseCase {
  constructor(
    @Inject(CUSTOM_FIELD_DEFINITION_REPOSITORY) private readonly definitions: CustomFieldDefinitionRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(id: string) {
    const existing = await this.definitions.findById(id);
    if (!existing) {
      throw new NotFoundException('Campo customizado não encontrado.');
    }

    const deactivated = await this.definitions.update(Object.assign(existing.deactivate(), { id: existing.id }));
    await this.auditLog.record({ entity: 'CustomFieldDefinition', entityId: deactivated.id, action: 'DEACTIVATE' });
    return deactivated;
  }
}
