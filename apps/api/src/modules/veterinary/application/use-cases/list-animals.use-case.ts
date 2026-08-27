import { Inject, Injectable } from '@nestjs/common';
import { buildPaginatedResult } from '../../../../common/dto/paginated-result';
import { ANIMAL_REPOSITORY, AnimalListFilters, AnimalRepository } from '../../domain/repositories/animal.repository';

@Injectable()
export class ListAnimalsUseCase {
  constructor(@Inject(ANIMAL_REPOSITORY) private readonly animals: AnimalRepository) {}

  async execute(filters: AnimalListFilters, page: number, limit: number) {
    const { items, total } = await this.animals.findAllPaginated(filters, page, limit);
    return buildPaginatedResult(items, total, page, limit);
  }
}
