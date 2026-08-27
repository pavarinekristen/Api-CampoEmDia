import { Evidence } from '../entities/evidence.entity';

export interface EvidenceRepository {
  create(evidence: Evidence): Promise<Evidence & { id: string }>;
  findByVisitId(visitId: string): Promise<Array<Evidence & { id: string }>>;
}

export const EVIDENCE_REPOSITORY = Symbol('EVIDENCE_REPOSITORY');
