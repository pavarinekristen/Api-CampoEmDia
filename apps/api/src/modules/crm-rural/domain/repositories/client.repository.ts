import { Client } from '../entities/client.entity';

export interface UpdateClientPatch {
  name?: string;
  contact?: string;
  notes?: string;
  customFields?: Record<string, unknown> | null;
}

export interface ClientRepository {
  create(client: Client): Promise<Client & { id: string }>;
  /** Retorna null se não existir OU estiver soft-deleted (deletedAt setado). */
  findById(id: string): Promise<(Client & { id: string }) | null>;
  findAllPaginated(page: number, limit: number): Promise<{ items: Array<Client & { id: string }>; total: number }>;
  /**
   * Update atômico e versionado: se `expectedVersion` for informado e não
   * bater com a versão atual no banco, retorna `'CONFLICT'` (o use-case
   * traduz para 409) — nunca aplica um update sobre versão desatualizada.
   */
  update(id: string, patch: UpdateClientPatch, expectedVersion?: number): Promise<(Client & { id: string }) | 'CONFLICT'>;
  /** Soft delete — nunca remove a linha de verdade (rastreabilidade). */
  softDelete(id: string): Promise<void>;
}

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');
