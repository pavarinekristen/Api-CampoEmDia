import { Animal, AnimalStatus } from '../entities/animal.entity';

export interface UpdateAnimalPatch {
  identifier?: string;
  loteId?: string;
  name?: string;
  species?: string;
  breed?: string;
  sex?: 'MACHO' | 'FEMEA';
  birthDate?: Date;
  customFields?: Record<string, unknown> | null;
}

export interface AnimalListFilters {
  propertyId: string;
  status?: AnimalStatus;
  loteId?: string;
}

export interface AnimalRepository {
  create(animal: Animal): Promise<Animal & { id: string }>;
  /** Retorna null se não existir OU estiver soft-deleted (deletedAt setado). */
  findById(id: string): Promise<(Animal & { id: string }) | null>;
  findAllPaginated(
    filters: AnimalListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: Array<Animal & { id: string }>; total: number }>;
  /** Sem paginação — usado pela exportação CSV. */
  findAllByProperty(propertyId: string): Promise<Array<Animal & { id: string }>>;
  /** Update atômico e versionado — mesmo padrão de ClientRepository.update. */
  update(id: string, patch: UpdateAnimalPatch, expectedVersion?: number): Promise<(Animal & { id: string }) | 'CONFLICT'>;
  /** Persiste a transição de status feita por Animal.changeStatus(). */
  saveStatus(animal: Animal & { id: string }): Promise<Animal & { id: string }>;
}

export const ANIMAL_REPOSITORY = Symbol('ANIMAL_REPOSITORY');
