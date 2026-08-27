import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Evidence, EvidenceType } from '../../domain/entities/evidence.entity';
import { EVIDENCE_REPOSITORY, EvidenceRepository } from '../../domain/repositories/evidence.repository';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';

export interface AddEvidenceInput {
  clientGeneratedId: string;
  visitId: string;
  type: EvidenceType;
  storageKey?: string;
  mimeType?: string;
  sizeBytes?: number;
  note?: string;
}

@Injectable()
export class AddEvidenceUseCase {
  constructor(
    @Inject(EVIDENCE_REPOSITORY) private readonly evidences: EvidenceRepository,
    @Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository,
  ) {}

  async execute(input: AddEvidenceInput) {
    const visit = await this.visits.findById(input.visitId);
    if (!visit) {
      throw new NotFoundException('Visita não encontrada.');
    }
    const evidence = Evidence.register(input);
    return this.evidences.create(evidence);
  }
}
