import { Lote } from '../entities/lote.entity';

export interface LoteRepository {
  create(lote: Lote): Promise<Lote & { id: string }>;
  findById(id: string): Promise<(Lote & { id: string }) | null>;
  findAllByProperty(propertyId: string): Promise<Array<Lote & { id: string }>>;
  update(lote: Lote & { id: string }): Promise<Lote & { id: string }>;
}

export const LOTE_REPOSITORY = Symbol('LOTE_REPOSITORY');
