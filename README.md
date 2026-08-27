# Campo em Dia — Backend

Monorepo do backend de "Campo em Dia" — plataforma de gestão de assistência técnica rural (agrônomos, zootecnistas, veterinários e técnicos de campo).

Arquitetura completa e racional de cada decisão: ver o plano arquitetural em
`C:\Users\Windows 11\.claude\plans\objetivo-assuma-a-persona-precious-naur.md`
(padrão: **Modular Monolith** em NestJS/TypeScript, não microsserviços — ver justificativa lá).

## Estrutura

```
apps/api/       → NestJS — monólito modular (identity-access, crm-rural, visits, media, reports, billing, sync)
apps/workers/    → Processos BullMQ separados (geração de PDF, transcrição de áudio)
libs/contracts/  → Schemas Zod compartilhados entre backend e o futuro PWA
prisma/          → schema.prisma + rls.sql (Row-Level Security)
docker-compose.yml → Postgres, Redis, MinIO (ambiente local completo, sem dependência de cloud)
```

## Pré-requisitos

- Node.js 20+
- Docker (para Postgres/Redis/MinIO locais)

## Setup

```bash
# 1. Instalar dependências de todo o monorepo
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Subir a infraestrutura local (Postgres, Redis, MinIO)
npm run dev:infra

# 4. Gerar o client do Prisma e aplicar as migrações
npm run prisma:generate
npm run prisma:migrate:dev

# 5. NÃO rode prisma/rls.sql ainda — ver o aviso no topo do próprio arquivo.
#    RLS depende de `SET LOCAL app.current_tenant_id` por requisição, que
#    ainda não está implementado no PrismaService. Aplicá-lo agora bloqueia
#    100% das queries da API. Isolamento de tenant hoje é garantido pela
#    camada de aplicação (ver apps/api/src/infra/prisma/tenant-scoping.ts,
#    testado em tenant-scoping.spec.ts).

# 6. Rodar a API
npm run dev:api

# 7. Em outro terminal — rodar os workers (PDF/transcrição)
npm run dev:workers
```

A API sobe em `http://localhost:3333` (Swagger em `http://localhost:3333/docs`). O console do MinIO fica em `http://localhost:9001` (usuário/senha em `docker-compose.yml`).

## Testes

```bash
npm run test        # unitários — cobertura prioritária: isolamento de tenant e idempotência de sync
npm run test:e2e     # fluxo de ouro completo (cadastro → visita → evidência → tarefa → encerramento → relatório)
                      # requer `npm run dev:infra` + migrações aplicadas
```

## Fluxo mínimo para testar manualmente (equivalente ao roteiro comercial do produto)

```
POST /auth/register        → cria o tenant + usuário proprietário
POST /auth/login           → obtém o accessToken (JWT)
POST /clients               → cadastra um cliente
POST /properties             → cadastra uma propriedade do cliente
POST /visits                 → inicia uma visita
POST /visits/:id/evidences   → registra uma evidência (texto/foto/áudio)
POST /visits/:id/tasks       → cria uma orientação/tarefa
PATCH /visits/:id/end        → encerra a visita (dispara a geração do relatório)
GET /reports/by-visit/:id    → consulta o status do relatório / link de download
```

## Decisões arquiteturais relevantes (resumo — detalhe completo no plano)

- **Multitenancy**: banco único, `tenantId` em toda tabela de negócio, filtro automático via `AsyncLocalStorage` (`apps/api/src/common/context/tenant-context.ts` + `apps/api/src/infra/prisma/tenant-scoping.ts`) — esta é a camada que garante isolamento hoje, testada em `tenant-scoping.spec.ts`. RLS (`prisma/rls.sql`) existe como segunda camada planejada, mas **não está habilitado** — falta wiring de `SET LOCAL app.current_tenant_id` por requisição (ver aviso no topo do arquivo).
- **Sincronização offline**: `clientGeneratedId` (UUID gerado no dispositivo) é a chave real de idempotência — não o `idempotencyKey` do envelope de sync. Ver `apps/api/src/modules/sync/`.
- **Mídia**: upload direto ao object storage via URL pré-assinada (`apps/api/src/infra/storage/`) — a API nunca recebe o binário.
- **PDF e transcrição de áudio**: sempre assíncronos, via fila BullMQ, processados em `apps/workers` — nunca no request/response da API.
- **Escopo desta versão do sync**: `visit`, `evidence` e `task` (que carregam `clientGeneratedId`). `property`/`client` ficam fora do sync automático nesta versão — tipicamente cadastrados com conectividade — e retornam `REJECTED` explicitamente se enviados via `/sync/push`.

## Próximos passos sugeridos

Ver a seção "Próximos Passos Recomendados" do plano arquitetural — validar o fluxo com usuários reais antes de expandir para os módulos especializados (Agronomia, Zootecnia, Veterinária).
