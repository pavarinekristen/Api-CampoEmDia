import { Inject, Injectable } from '@nestjs/common';
import {
  ANIMAL_HEALTH_EVENT_REPOSITORY,
  AnimalHealthEventRepository,
} from '../../domain/repositories/animal-health-event.repository';

@Injectable()
export class ListUpcomingHealthEventsUseCase {
  constructor(
    @Inject(ANIMAL_HEALTH_EVENT_REPOSITORY) private readonly healthEvents: AnimalHealthEventRepository,
  ) {}

  async execute(withinDays: number) {
    return this.healthEvents.findUpcoming(withinDays);
  }
}
