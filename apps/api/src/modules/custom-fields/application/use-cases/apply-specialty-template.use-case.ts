import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { tenantContext } from '../../../../common/context/tenant-context';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';
import { CustomFieldDefinition } from '../../domain/entities/custom-field-definition.entity';
import {
  CUSTOM_FIELD_DEFINITION_REPOSITORY,
  CustomFieldDefinitionRepository,
} from '../../domain/repositories/custom-field-definition.repository';
import { Specialty, SPECIALTY_TEMPLATES } from '../specialty-templates';

@Injectable()
export class ApplySpecialtyTemplateUseCase {
  constructor(
    @Inject(CUSTOM_FIELD_DEFINITION_REPOSITORY) private readonly definitions: CustomFieldDefinitionRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(specialty: Specialty) {
    const template = SPECIALTY_TEMPLATES[specialty];
    if (!template) {
      throw new BadRequestException(`Especialidade "${specialty}" não reconhecida.`);
    }

    const { tenantId } = tenantContext.getOrThrow();
    const toCreate = template.map((field) => CustomFieldDefinition.create({ tenantId, ...field }));
    const createdCount = await this.definitions.createManySkippingDuplicates(toCreate);

    await this.auditLog.record({
      entity: 'CustomFieldDefinition',
      entityId: specialty,
      action: 'APPLY_TEMPLATE',
      diff: { specialty, createdCount, totalInTemplate: template.length },
    });
    return { specialty, createdCount, totalInTemplate: template.length };
  }
}
