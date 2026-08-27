import { Inject, Injectable } from '@nestjs/common';
import { buildPaginatedResult } from '../../../../common/dto/paginated-result';
import {
  ANIMAL_HEALTH_EVENT_REPOSITORY,
  AnimalHealthEventRepository,
} from '../../domain/repositories/animal-health-event.repository';

@Injectable()
export class ListHealthEventsUseCase {
  constructor(
    @Inject(ANIMAL_HEALTH_EVENT_REPOSITORY) private readonly healthEvents: AnimalHealthEventRepository,
  ) {}

  async execute(animalId: string, page: number, limit: number) {
    const { items, total } = await this.healthEvents.findByAnimalIdPaginated(animalId, page, limit);
    return buildPaginatedResult(items, total, page, limit);
  }
}
