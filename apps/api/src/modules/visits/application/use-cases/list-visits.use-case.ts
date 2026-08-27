import { Inject, Injectable } from '@nestjs/common';
import { buildPaginatedResult } from '../../../../common/dto/paginated-result';
import { VISIT_REPOSITORY, VisitListFilters, VisitRepository } from '../../domain/repositories/visit.repository';

@Injectable()
export class ListVisitsUseCase {
  constructor(@Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository) {}

  async execute(filters: VisitListFilters, page: number, limit: number) {
    const { items, total } = await this.visits.findAllByTenant(filters, page, limit);
    return buildPaginatedResult(items, total, page, limit);
  }
}
