import { AnimalHealthEvent } from '../entities/animal-health-event.entity';

export interface AnimalHealthEventRepository {
  create(event: AnimalHealthEvent): Promise<AnimalHealthEvent & { id: string }>;
  findByAnimalIdPaginated(
    animalId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Array<AnimalHealthEvent & { id: string }>; total: number }>;
  /**
   * Eventos com `nextDueDate` ou `withdrawalUntil` dentro dos próximos
   * `withinDays` dias — a consulta que substitui a planilha de controle de
   * vencimento.
   */
  findUpcoming(withinDays: number): Promise<Array<AnimalHealthEvent & { id: string }>>;
}

export const ANIMAL_HEALTH_EVENT_REPOSITORY = Symbol('ANIMAL_HEALTH_EVENT_REPOSITORY');
