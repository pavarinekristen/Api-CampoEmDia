import { PrismaClient } from '@prisma/client';

/**
 * Workers rodam fora do ciclo de vida de requisição HTTP — não há
 * TenantContext (AsyncLocalStorage) nem o middleware de tenant do
 * PrismaService da API. Por isso usamos o PrismaClient puro aqui, e cada
 * query abaixo inclui `tenantId` explicitamente no `where`, vindo direto
 * do payload do job (que por sua vez veio do evento de domínio já
 * autenticado que originou o job).
 */
export const prisma = new PrismaClient();
