import { applyTenantScope, MissingTenantContextError } from './tenant-scoping';

describe('applyTenantScope — isolamento de tenant (crítico de segurança)', () => {
  const TENANT_A = 'tenant-a-uuid';
  const TENANT_B = 'tenant-b-uuid';

  it('injeta tenantId no where de uma leitura (findMany)', () => {
    const result = applyTenantScope(
      { model: 'Visit', action: 'findMany', args: { where: { status: 'EM_ANDAMENTO' } } },
      TENANT_A,
    );
    expect(result.args.where).toEqual({ status: 'EM_ANDAMENTO', tenantId: TENANT_A });
  });

  it('NUNCA permite que um where malicioso sobrescreva o tenantId injetado', () => {
    // Cenário de ataque: o tenant A manipula o payload tentando forçar
    // tenantId de outro tenant. O spread ordering em applyTenantScope
    // garante que o tenantId do contexto autenticado sempre vence.
    const result = applyTenantScope(
      { model: 'Visit', action: 'findMany', args: { where: { tenantId: TENANT_B } } },
      TENANT_A,
    );
    expect(result.args.where).toEqual({ tenantId: TENANT_A });
  });

  it('injeta tenantId no data de uma criação (create)', () => {
    const result = applyTenantScope(
      { model: 'Client', action: 'create', args: { data: { name: 'Fazenda Boa Vista' } } },
      TENANT_A,
    );
    expect(result.args.data).toEqual({ name: 'Fazenda Boa Vista', tenantId: TENANT_A });
  });

  it('injeta tenantId em todos os itens de uma criação em lote (createMany)', () => {
    const result = applyTenantScope(
      {
        model: 'TaskItem',
        action: 'createMany',
        args: { data: [{ description: 'Tarefa 1' }, { description: 'Tarefa 2' }] },
      },
      TENANT_A,
    );
    expect(result.args.data).toEqual([
      { description: 'Tarefa 1', tenantId: TENANT_A },
      { description: 'Tarefa 2', tenantId: TENANT_A },
    ]);
  });

  it('injeta tenantId no where de update/delete', () => {
    const updateResult = applyTenantScope(
      { model: 'Property', action: 'update', args: { where: { id: 'prop-1' }, data: { name: 'Novo nome' } } },
      TENANT_A,
    );
    expect(updateResult.args.where).toEqual({ id: 'prop-1', tenantId: TENANT_A });

    const deleteResult = applyTenantScope(
      { model: 'Property', action: 'delete', args: { where: { id: 'prop-1' } } },
      TENANT_A,
    );
    expect(deleteResult.args.where).toEqual({ id: 'prop-1', tenantId: TENANT_A });
  });

  it('lança MissingTenantContextError se um model tenant-scoped for acessado sem contexto', () => {
    expect(() => applyTenantScope({ model: 'Visit', action: 'findMany', args: {} }, undefined)).toThrow(
      MissingTenantContextError,
    );
  });

  it('não aplica nenhum filtro em models que não são tenant-scoped (ex: Tenant)', () => {
    const result = applyTenantScope({ model: 'Tenant', action: 'findMany', args: { where: {} } }, undefined);
    expect(result.args.where).toEqual({});
  });

  it('não aplica filtro quando não há model (ex: $queryRaw)', () => {
    const result = applyTenantScope({ action: 'queryRaw', args: {} }, undefined);
    expect(result.args).toEqual({});
  });
});
