import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AnimalStatus } from '../../domain/entities/animal.entity';
import { ANIMAL_REPOSITORY, AnimalRepository } from '../../domain/repositories/animal.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface ChangeAnimalStatusInput {
  animalId: string;
  status: Exclude<AnimalStatus, 'ATIVO'>;
  reason?: string;
  at: Date;
}

@Injectable()
export class ChangeAnimalStatusUseCase {
  constructor(
    @Inject(ANIMAL_REPOSITORY) private readonly animals: AnimalRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: ChangeAnimalStatusInput) {
    const existing = await this.animals.findById(input.animalId);
    if (!existing) {
      throw new NotFoundException('Animal não encontrado.');
    }

    const changed = existing.changeStatus(input.status, input.reason, input.at);
    const saved = await this.animals.saveStatus(Object.assign(changed, { id: existing.id }));

    await this.auditLog.record({
      entity: 'Animal',
      entityId: saved.id,
      action: 'CHANGE_STATUS',
      diff: { status: input.status, reason: input.reason },
    });
    return saved;
  }
}
