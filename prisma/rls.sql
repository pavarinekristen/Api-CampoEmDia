-- Row-Level Security — segunda camada de isolamento de tenant (defesa em
-- profundidade), complementar ao filtro aplicado em PrismaService.
--
-- ⚠ PRÉ-REQUISITO AINDA NÃO IMPLEMENTADO — NÃO APLIQUE ESTE SCRIPT AINDA:
-- FORCE ROW LEVEL SECURITY exige que cada sessão do Postgres tenha a
-- variável `app.current_tenant_id` setada (via `SET LOCAL`) antes de cada
-- query. O PrismaService atual (apps/api/src/infra/prisma/prisma.service.ts)
-- injeta o filtro de tenant apenas na camada de aplicação — ele NÃO seta
-- essa variável de sessão. Aplicar este script no estado atual do código
-- bloquearia 100% das queries da API (toda leitura passaria a retornar
-- zero linhas), porque `current_setting('app.current_tenant_id', true)`
-- nunca teria valor.
--
-- Para habilitar de fato: envolver as operações tenant-scoped em
-- `prisma.$transaction(async (tx) => { await tx.$executeRaw`SET LOCAL
-- app.current_tenant_id = ${tenantId}`; ... })` — mudança arquitetural
-- deliberadamente adiada (custo de performance de transacionar toda
-- leitura) até haver necessidade real de compliance que justifique.
-- Isolamento de tenant HOJE é garantido apenas pela camada de aplicação
-- (testada em tenant-scoping.spec.ts) — trate isso como o estado real.
--
-- Este script NÃO é uma migration gerada pelo Prisma (RLS não é modelável
-- no schema.prisma). Quando o pré-requisito acima estiver implementado,
-- aplique com:
--
--   psql "$DATABASE_URL" -f prisma/rls.sql
--
-- Em produção, isso deveria rodar como uma etapa própria do pipeline de
-- deploy, depois de `prisma migrate deploy`.

-- A API deve conectar usando um role de aplicação (não o superuser/owner),
-- para que RLS seja de fato aplicada (donos de tabela ignoram RLS por
-- padrão no Postgres).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'campo_em_dia_app') THEN
    CREATE ROLE campo_em_dia_app LOGIN PASSWORD 'campo_em_dia_app_change_me';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO campo_em_dia_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO campo_em_dia_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO campo_em_dia_app;

-- Habilita RLS e cria a política de isolamento em cada tabela tenant-scoped.
-- A sessão da API deve setar `app.current_tenant_id` no início de cada
-- requisição (ex: via `SET LOCAL app.current_tenant_id = '<uuid>'` dentro
-- de uma transação, espelhando o tenantId já presente no AsyncLocalStorage).
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users', 'clients', 'properties', 'visits', 'evidences', 'tasks', 'reports', 'service_charges', 'audit_logs']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);
    -- Comparação como texto: `tenantId` é `String @default(uuid())` no
    -- Prisma, que mapeia para a coluna Postgres `text`/`varchar`, não o
    -- tipo nativo `uuid` — um cast `::uuid` aqui falha em runtime
    -- ("operator does not exist: text = uuid").
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
         USING ("tenantId" = current_setting(''app.current_tenant_id'', true));',
      tbl
    );
  END LOOP;
END
$$;
