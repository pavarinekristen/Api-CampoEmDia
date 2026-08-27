import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { tenantContext } from '../../../../common/context/tenant-context';
import { AnimalHealthEvent, HealthEventType, PregnancyStatus } from '../../domain/entities/animal-health-event.entity';
import {
  ANIMAL_HEALTH_EVENT_REPOSITORY,
  AnimalHealthEventRepository,
} from '../../domain/repositories/animal-health-event.repository';
import { ANIMAL_REPOSITORY, AnimalRepository } from '../../domain/repositories/animal.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface CreateHealthEventInput {
  animalId: string;
  visitId?: string;
  type: HealthEventType;
  description: string;
  productName?: string;
  doseInfo?: string;
  appliedById?: string;
  appliedAt: Date;
  withdrawalUntil?: Date;
  nextDueDate?: Date;
  pregnancyStatus?: PregnancyStatus;
  expectedBirthDate?: Date;
  notes?: string;
}

@Injectable()
export class CreateHealthEventUseCase {
  constructor(
    @Inject(ANIMAL_HEALTH_EVENT_REPOSITORY) private readonly healthEvents: AnimalHealthEventRepository,
    @Inject(ANIMAL_REPOSITORY) private readonly animals: AnimalRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: CreateHealthEventInput) {
    const animal = await this.animals.findById(input.animalId);
    if (!animal) {
      throw new NotFoundException('Animal não encontrado.');
    }

    // Se quem aplicou não foi informado, assume o usuário autenticado.
    const appliedById = input.appliedById ?? tenantContext.getOrThrow().userId;
    const event = AnimalHealthEvent.create({ ...input, appliedById });
    const created = await this.healthEvents.create(event);

    await this.auditLog.record({
      entity: 'AnimalHealthEvent',
      entityId: created.id,
      action: 'CREATE',
      diff: { animalId: input.animalId, type: input.type },
    });
    return created;
  }
}
