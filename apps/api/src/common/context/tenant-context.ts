import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Contexto de tenant por requisição.
 *
 * Este é o mecanismo central da estratégia de multitenancy (camada de
 * aplicação): o `TenantInterceptor` extrai o tenantId do JWT autenticado e
 * o propaga aqui. `PrismaService` lê este contexto para injetar o filtro
 * `tenantId` automaticamente em toda query — nenhum repositório precisa (ou
 * deve) lembrar de filtrar por tenant manualmente.
 *
 * Isso é a primeira das duas camadas de isolamento. A segunda é Row-Level
 * Security no Postgres (ver prisma/migrations — RLS), que rejeita a query
 * no próprio banco mesmo que a aplicação falhe em aplicar o filtro.
 */
export interface RequestContext {
  tenantId: string;
  userId: string;
  role: string;
}

class TenantContextStorage {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  getOrThrow(): RequestContext {
    const ctx = this.storage.getStore();
    if (!ctx) {
      throw new Error(
        'TenantContext ausente: esta operação precisa rodar dentro de uma requisição autenticada.',
      );
    }
    return ctx;
  }
}

export const tenantContext = new TenantContextStorage();
