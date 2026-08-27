import { IsEnum } from 'class-validator';
import { CustomFieldEntityType } from '../../domain/entities/custom-field-definition.entity';

const ENTITY_TYPES: CustomFieldEntityType[] = ['CLIENT', 'PROPERTY', 'VISIT', 'ANIMAL'];

export class ListCustomFieldsQueryDto {
  @IsEnum(ENTITY_TYPES)
  entityType!: CustomFieldEntityType;
}
