import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { tenantContext } from '../../../../common/context/tenant-context';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';
import { CustomFieldDefinition, CustomFieldEntityType, CustomFieldType } from '../../domain/entities/custom-field-definition.entity';
import {
  CUSTOM_FIELD_DEFINITION_REPOSITORY,
  CustomFieldDefinitionRepository,
} from '../../domain/repositories/custom-field-definition.repository';

export interface CreateCustomFieldInput {
  entityType: CustomFieldEntityType;
  key: string;
  label: string;
  fieldType: CustomFieldType;
  options?: string[];
  required?: boolean;
  order?: number;
}

@Injectable()
export class CreateCustomFieldUseCase {
  constructor(
    @Inject(CUSTOM_FIELD_DEFINITION_REPOSITORY) private readonly definitions: CustomFieldDefinitionRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: CreateCustomFieldInput) {
    const { tenantId } = tenantContext.getOrThrow();
    const definition = CustomFieldDefinition.create({ tenantId, ...input });

    let created: CustomFieldDefinition & { id: string };
    try {
      created = await this.definitions.create(definition);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Já existe um campo "${input.key}" para "${input.entityType}".`);
      }
      throw error;
    }

    await this.auditLog.record({
      entity: 'CustomFieldDefinition',
      entityId: created.id,
      action: 'CREATE',
      diff: { entityType: input.entityType, key: input.key },
    });
    return created;
  }
}
