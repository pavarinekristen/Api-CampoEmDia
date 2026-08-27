import { CustomFieldDefinition, CustomFieldEntityType } from '../entities/custom-field-definition.entity';

export interface CustomFieldDefinitionRepository {
  create(definition: CustomFieldDefinition): Promise<CustomFieldDefinition & { id: string }>;
  findById(id: string): Promise<(CustomFieldDefinition & { id: string }) | null>;
  /** Sem paginação — número de campos customizados por tenant/entityType é sempre pequeno. */
  findAllByEntityType(entityType: CustomFieldEntityType, onlyActive?: boolean): Promise<Array<CustomFieldDefinition & { id: string }>>;
  update(definition: CustomFieldDefinition & { id: string }): Promise<CustomFieldDefinition & { id: string }>;
  /** Cria em lote ignorando duplicatas por [tenantId, entityType, key] — usado pelos templates de especialidade. */
  createManySkippingDuplicates(definitions: CustomFieldDefinition[]): Promise<number>;
}

export const CUSTOM_FIELD_DEFINITION_REPOSITORY = Symbol('CUSTOM_FIELD_DEFINITION_REPOSITORY');
