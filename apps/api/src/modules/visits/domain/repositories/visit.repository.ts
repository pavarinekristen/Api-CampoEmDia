import { Visit } from '../entities/visit.entity';

export interface VisitRepository {
  create(visit: Visit): Promise<Visit & { id: string }>;
  findById(id: string): Promise<(Visit & { id: string }) | null>;
  /** Usado pela sincronização para idempotência (ver módulo `sync`). */
  findByClientGeneratedId(clientGeneratedId: string): Promise<(Visit & { id: string }) | null>;
  save(visit: Visit & { id: string }): Promise<Visit & { id: string }>;
}

export const VISIT_REPOSITORY = Symbol('VISIT_REPOSITORY');
