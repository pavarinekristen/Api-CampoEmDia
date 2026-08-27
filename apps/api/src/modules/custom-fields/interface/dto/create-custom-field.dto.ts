import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { CustomFieldEntityType, CustomFieldType } from '../../domain/entities/custom-field-definition.entity';

const ENTITY_TYPES: CustomFieldEntityType[] = ['CLIENT', 'PROPERTY', 'VISIT', 'ANIMAL'];
const FIELD_TYPES: CustomFieldType[] = ['TEXTO', 'NUMERO', 'DATA', 'SIM_NAO', 'LISTA', 'LISTA_MULTIPLA'];

export class CreateCustomFieldDto {
  @IsEnum(ENTITY_TYPES)
  entityType!: CustomFieldEntityType;

  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'key deve ser minúscula, começar com letra e usar apenas letras/números/underscore' })
  key!: string;

  @IsString()
  @MinLength(2)
  label!: string;

  @IsEnum(FIELD_TYPES)
  fieldType!: CustomFieldType;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
