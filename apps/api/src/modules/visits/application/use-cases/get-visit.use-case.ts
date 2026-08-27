import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';

@Injectable()
export class GetVisitUseCase {
  constructor(@Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository) {}

  async execute(id: string) {
    const visit = await this.visits.findById(id);
    if (!visit) {
      throw new NotFoundException('Visita não encontrada.');
    }
    return visit;
  }
}
