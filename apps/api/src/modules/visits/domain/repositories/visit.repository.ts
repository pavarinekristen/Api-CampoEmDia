import { Visit, VisitStatus } from '../entities/visit.entity';

export interface VisitListFilters {
  propertyId?: string;
  status?: VisitStatus;
}

export interface VisitRepository {
  create(visit: Visit): Promise<Visit & { id: string }>;
  findById(id: string): Promise<(Visit & { id: string }) | null>;
  /** Usado pela sincronização para idempotência (ver módulo `sync`). */
  findByClientGeneratedId(clientGeneratedId: string): Promise<(Visit & { id: string }) | null>;
  save(visit: Visit & { id: string }): Promise<Visit & { id: string }>;
  findAllByTenant(
    filters: VisitListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: Array<Visit & { id: string }>; total: number }>;
}

export const VISIT_REPOSITORY = Symbol('VISIT_REPOSITORY');
