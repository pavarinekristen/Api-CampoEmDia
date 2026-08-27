import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { resolve } from 'node:path';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './infra/prisma/prisma.module';
import { QueueModule } from './infra/queue/queue.module';
import { StorageModule } from './infra/storage/storage.module';
import { IdentityAccessModule } from './modules/identity-access/identity-access.module';
import { CrmRuralModule } from './modules/crm-rural/crm-rural.module';
import { VisitsModule } from './modules/visits/visits.module';
import { MediaModule } from './modules/media/media.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BillingModule } from './modules/billing/billing.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // `npm run --workspace=apps/api` executa com cwd na própria pasta do
      // workspace, não na raiz do monorepo — por isso o caminho do .env é
      // resolvido explicitamente (mesma solução aplicada em
      // apps/workers/src/main.ts). `src/` e `dist/` ficam ambos um nível
      // abaixo de `apps/api/`, então o mesmo caminho relativo funciona
      // tanto em desenvolvimento (ts-node, rodando de `src/`) quanto no
      // build compilado (rodando de `dist/`).
      envFilePath: resolve(__dirname, '../../../.env'),
    }),
    EventEmitterModule.forRoot(),

    // Infraestrutura compartilhada
    PrismaModule,
    QueueModule,
    StorageModule,

    // Módulos de negócio — cada um é uma fronteira interna do monólito
    // modular (ver plano arquitetural). Comunicação entre módulos passa
    // apenas pelas suas camadas `application`/`interface` públicas, nunca
    // por acesso direto a `domain`/`infrastructure` de outro módulo.
    IdentityAccessModule,
    CrmRuralModule,
    VisitsModule,
    MediaModule,
    ReportsModule,
    BillingModule,
    SyncModule,
  ],
})
export class AppModule {}
