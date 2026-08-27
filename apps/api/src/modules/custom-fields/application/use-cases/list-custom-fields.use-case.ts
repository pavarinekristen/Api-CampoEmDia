import { Inject, Injectable } from '@nestjs/common';
import { CustomFieldEntityType } from '../../domain/entities/custom-field-definition.entity';
import {
  CUSTOM_FIELD_DEFINITION_REPOSITORY,
  CustomFieldDefinitionRepository,
} from '../../domain/repositories/custom-field-definition.repository';

@Injectable()
export class ListCustomFieldsUseCase {
  constructor(@Inject(CUSTOM_FIELD_DEFINITION_REPOSITORY) private readonly definitions: CustomFieldDefinitionRepository) {}

  async execute(entityType: CustomFieldEntityType, onlyActive = true) {
    return this.definitions.findAllByEntityType(entityType, onlyActive);
  }
}
