/**
 * Lógica pura de aplicação do filtro de tenant — extraída do middleware do
 * PrismaService para ser testável sem precisar de uma conexão real de
 * banco (ver tenant-scoping.spec.ts).
 *
 * Este é o ponto mais crítico de segurança do sistema: qualquer regressão
 * aqui significa potencial vazamento de dado entre tenants.
 */

/**
 * Modelos que carregam `tenantId` e por isso precisam do filtro automático
 * de tenant em toda leitura/escrita. Mantido como allowlist explícita (em
 * vez de "todo model exceto X") para forçar uma decisão consciente sempre
 * que um novo model for adicionado ao schema.
 */
export const TENANT_SCOPED_MODELS = new Set([
  'User',
  'Client',
  'Property',
  'Visit',
  'Evidence',
  'TaskItem',
  'Report',
  'ServiceCharge',
  'AuditLog',
  'CustomFieldDefinition',
  'Animal',
  'Lote',
  'AnimalHealthEvent',
]);

export type PrismaAction =
  | 'findUnique'
  | 'findFirst'
  | 'findMany'
  | 'count'
  | 'aggregate'
  | 'create'
  | 'createMany'
  | 'update'
  | 'updateMany'
  | 'delete'
  | 'deleteMany'
  | 'upsert'
  | string;

export interface ScopingParams {
  model?: string;
  action: PrismaAction;
  args: Record<string, unknown>;
}

export class MissingTenantContextError extends Error {
  constructor(model: string) {
    super(`Operação em model tenant-scoped "${model}" sem TenantContext ativo.`);
  }
}

/**
 * Recebe os `params` de uma chamada Prisma e retorna uma NOVA cópia com o
 * filtro/injeção de `tenantId` aplicado, de acordo com a ação. Não muta o
 * objeto de entrada — facilita testar sem efeitos colaterais.
 *
 * Lança `MissingTenantContextError` se o model é tenant-scoped e nenhum
 * tenantId foi fornecido — nunca deixa a operação passar "sem filtro" por
 * omissão.
 */
export function applyTenantScope(params: ScopingParams, tenantId: string | undefined): ScopingParams {
  if (!params.model || !TENANT_SCOPED_MODELS.has(params.model)) {
    return params;
  }

  if (!tenantId) {
    throw new MissingTenantContextError(params.model);
  }

  const args = { ...params.args };

  switch (params.action) {
    case 'findUnique':
    case 'findFirst':
    case 'findMany':
    case 'count':
    case 'aggregate':
      args.where = { ...(args.where as Record<string, unknown> | undefined), tenantId };
      break;
    case 'create':
      args.data = { ...(args.data as Record<string, unknown> | undefined), tenantId };
      break;
    case 'createMany':
      args.data = (args.data as Record<string, unknown>[]).map((d) => ({ ...d, tenantId }));
      break;
    case 'update':
    case 'updateMany':
    case 'delete':
    case 'deleteMany':
    case 'upsert':
      args.where = { ...(args.where as Record<string, unknown> | undefined), tenantId };
      break;
    default:
      break;
  }

  return { ...params, args };
}
