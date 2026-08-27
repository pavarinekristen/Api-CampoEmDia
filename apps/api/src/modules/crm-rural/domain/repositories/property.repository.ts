import { Property } from '../entities/property.entity';

export interface UpdatePropertyPatch {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  activities?: string;
  frequency?: string;
}

export interface PropertyRepository {
  create(property: Property): Promise<Property & { id: string }>;
  /** Retorna null se não existir OU estiver soft-deleted (deletedAt setado). */
  findById(id: string): Promise<(Property & { id: string }) | null>;
  findByClientIdPaginated(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Array<Property & { id: string }>; total: number }>;
  /** Update atômico e versionado — ver ClientRepository.update para o racional. */
  update(
    id: string,
    patch: UpdatePropertyPatch,
    expectedVersion?: number,
  ): Promise<(Property & { id: string }) | 'CONFLICT'>;
  softDelete(id: string): Promise<void>;
}

export const PROPERTY_REPOSITORY = Symbol('PROPERTY_REPOSITORY');
