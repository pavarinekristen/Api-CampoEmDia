import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantContext } from '../../common/context/tenant-context';
import { applyTenantScope } from './tenant-scoping';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    // Camada de aplicação da estratégia de multitenancy — a lógica real de
    // filtro vive em `applyTenantScope` (tenant-scoping.ts), testada
    // isoladamente sem depender de conexão de banco. Isto é a PRIMEIRA de
    // duas camadas de isolamento — a segunda é RLS no Postgres
    // (ver prisma/rls.sql), que barra o acesso mesmo se este middleware for
    // removido ou ignorado por engano em algum lugar.
    this.$use(async (params, next) => {
      const ctx = tenantContext.get();
      const scoped = applyTenantScope({ model: params.model, action: params.action, args: params.args ?? {} }, ctx?.tenantId);
      return next({ ...params, args: scoped.args });
    });
  }

  async onModuleInit() {
    this.$on('warn' as never, (e: unknown) => this.logger.warn(e));
    this.$on('error' as never, (e: unknown) => this.logger.error(e));
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
