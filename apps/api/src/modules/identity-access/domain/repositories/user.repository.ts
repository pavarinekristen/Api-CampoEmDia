import { User } from '../entities/user.entity';

/**
 * Porta (interface) — a camada de domínio/aplicação não conhece Prisma.
 * A implementação concreta vive em `infrastructure/prisma-user.repository.ts`.
 */
export interface UserRepository {
  /**
   * Busca por e-mail SEM escopo de tenant — necessário para o login, onde
   * o tenant ainda não é conhecido. Implementação usa raw query para
   * contornar deliberadamente o filtro automático de tenant do
   * PrismaService (ver comentário na implementação).
   */
  findByEmailAcrossTenants(email: string): Promise<(User & { id: string }) | null>;

  create(user: User): Promise<User & { id: string }>;

  /** Tenant-scoped — roda sob o TenantContext ambiente da requisição autenticada. */
  findById(id: string): Promise<(User & { id: string }) | null>;
  findAllByTenant(page: number, limit: number): Promise<{ items: Array<User & { id: string }>; total: number }>;
  update(user: User & { id: string }): Promise<User & { id: string }>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
