import { Inject, Injectable } from '@nestjs/common';
import { Visit, VisitType } from '../../domain/entities/visit.entity';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';

export interface StartVisitInput {
  clientGeneratedId: string;
  propertyId: string;
  professionalId: string;
  type: VisitType;
  startedAt: Date;
}

@Injectable()
export class StartVisitUseCase {
  constructor(@Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository) {}

  async execute(input: StartVisitInput) {
    // Idempotência: se esta visita já foi sincronizada antes (retry de
    // rede em conexão instável), retorna o registro existente em vez de
    // duplicar — mesma lógica aplicada pelo motor de sync (módulo `sync`).
    const existing = await this.visits.findByClientGeneratedId(input.clientGeneratedId);
    if (existing) return existing;

    const visit = Visit.start(input);
    return this.visits.create(visit);
  }
}
