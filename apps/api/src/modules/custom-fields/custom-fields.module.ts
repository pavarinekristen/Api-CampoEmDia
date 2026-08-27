import { Module } from '@nestjs/common';
import { CustomFieldsController } from './interface/custom-fields.controller';
import { CreateCustomFieldUseCase } from './application/use-cases/create-custom-field.use-case';
import { ListCustomFieldsUseCase } from './application/use-cases/list-custom-fields.use-case';
import { UpdateCustomFieldUseCase } from './application/use-cases/update-custom-field.use-case';
import { DeactivateCustomFieldUseCase } from './application/use-cases/deactivate-custom-field.use-case';
import { ApplySpecialtyTemplateUseCase } from './application/use-cases/apply-specialty-template.use-case';
import { CustomFieldsValidatorService } from './application/custom-fields-validator.service';
import { PrismaCustomFieldDefinitionRepository } from './infrastructure/prisma-custom-field-definition.repository';
import { CUSTOM_FIELD_DEFINITION_REPOSITORY } from './domain/repositories/custom-field-definition.repository';

@Module({
  controllers: [CustomFieldsController],
  providers: [
    CreateCustomFieldUseCase,
    ListCustomFieldsUseCase,
    UpdateCustomFieldUseCase,
    DeactivateCustomFieldUseCase,
    ApplySpecialtyTemplateUseCase,
    CustomFieldsValidatorService,
    { provide: CUSTOM_FIELD_DEFINITION_REPOSITORY, useClass: PrismaCustomFieldDefinitionRepository },
  ],
  // CustomFieldsValidatorService é a peça que outros módulos (crm-rural,
  // visits, veterinary) importam para validar customFields antes de salvar.
  // CUSTOM_FIELD_DEFINITION_REPOSITORY também é exportado porque
  // ExportAnimalsCsvUseCase (veterinary) precisa listar as definições
  // ativas para montar as colunas dinâmicas do CSV.
  exports: [CustomFieldsValidatorService, CUSTOM_FIELD_DEFINITION_REPOSITORY],
})
export class CustomFieldsModule {}
