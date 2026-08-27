import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ANIMAL_REPOSITORY, AnimalRepository, UpdateAnimalPatch } from '../../domain/repositories/animal.repository';
import { CustomFieldsValidatorService } from '../../../custom-fields/application/custom-fields-validator.service';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface UpdateAnimalInput extends UpdateAnimalPatch {
  animalId: string;
  version?: number;
}

@Injectable()
export class UpdateAnimalUseCase {
  constructor(
    @Inject(ANIMAL_REPOSITORY) private readonly animals: AnimalRepository,
    private readonly customFieldsValidator: CustomFieldsValidatorService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdateAnimalInput) {
    const existing = await this.animals.findById(input.animalId);
    if (!existing) {
      throw new NotFoundException('Animal não encontrado.');
    }

    const { animalId, version, ...patch } = input;
    if (patch.customFields !== undefined) {
      patch.customFields = await this.customFieldsValidator.validate('ANIMAL', patch.customFields);
    }

    const result = await this.animals.update(animalId, patch, version);
    if (result === 'CONFLICT') {
      throw new ConflictException('O animal foi alterado por outra sessão — recarregue e tente novamente.');
    }

    await this.auditLog.record({ entity: 'Animal', entityId: result.id, action: 'UPDATE', diff: patch });
    return result;
  }
}
