import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';
import {
  CUSTOM_FIELD_DEFINITION_REPOSITORY,
  CustomFieldDefinitionRepository,
} from '../../domain/repositories/custom-field-definition.repository';

export interface UpdateCustomFieldInput {
  id: string;
  label?: string;
  options?: string[];
  required?: boolean;
  order?: number;
}

@Injectable()
export class UpdateCustomFieldUseCase {
  constructor(
    @Inject(CUSTOM_FIELD_DEFINITION_REPOSITORY) private readonly definitions: CustomFieldDefinitionRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdateCustomFieldInput) {
    const existing = await this.definitions.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Campo customizado não encontrado.');
    }

    const updated = await this.definitions.update(
      Object.assign(existing.update(input), { id: existing.id }),
    );

    await this.auditLog.record({ entity: 'CustomFieldDefinition', entityId: updated.id, action: 'UPDATE' });
    return updated;
  }
}
