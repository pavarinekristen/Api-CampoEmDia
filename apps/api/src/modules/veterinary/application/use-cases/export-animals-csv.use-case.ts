import { Inject, Injectable } from '@nestjs/common';
import { ANIMAL_REPOSITORY, AnimalRepository } from '../../domain/repositories/animal.repository';
import {
  CUSTOM_FIELD_DEFINITION_REPOSITORY,
  CustomFieldDefinitionRepository,
} from '../../../custom-fields/domain/repositories/custom-field-definition.repository';

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exportação em CSV — bridge pra quem ainda quer abrir no Excel ou mandar
 * pra alguém que usa planilha. O sistema continua sendo a fonte de
 * verdade; isto é só uma saída num formato familiar, não reintroduz a
 * planilha como fonte de dados.
 */
@Injectable()
export class ExportAnimalsCsvUseCase {
  constructor(
    @Inject(ANIMAL_REPOSITORY) private readonly animals: AnimalRepository,
    @Inject(CUSTOM_FIELD_DEFINITION_REPOSITORY) private readonly definitions: CustomFieldDefinitionRepository,
  ) {}

  async execute(propertyId: string): Promise<string> {
    const [animals, customFieldDefs] = await Promise.all([
      this.animals.findAllByProperty(propertyId),
      this.definitions.findAllByEntityType('ANIMAL', true),
    ]);

    const coreColumns = ['identifier', 'name', 'species', 'breed', 'sex', 'birthDate', 'status', 'loteId'];
    const customColumns = customFieldDefs.map((d) => d.key);
    const header = [...coreColumns, ...customColumns];

    const lines = [header.map(escapeCsvCell).join(',')];
    for (const animal of animals) {
      const row = [
        animal.identifier,
        animal.name,
        animal.species,
        animal.breed,
        animal.sex,
        animal.birthDate?.toISOString().slice(0, 10),
        animal.status,
        animal.loteId,
        ...customColumns.map((key) => animal.customFields?.[key]),
      ];
      lines.push(row.map(escapeCsvCell).join(','));
    }

    return lines.join('\n');
  }
}
