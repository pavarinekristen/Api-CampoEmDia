import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';

export interface SyncPullInput {
  cursor?: string; // formato: "<updatedAt-ISO>_<id>"
  limit: number;
}

export interface SyncPullOutput {
  items: unknown[];
  nextCursor: string | null;
}

/**
 * Pull de mudanças por keyset pagination (updatedAt, id) — evita os
 * problemas clássicos de paginação por OFFSET (itens pulados/duplicados
 * quando há escrita concorrente durante a paginação) e não depende do
 * relógio do dispositivo cliente.
 *
 * Implementação de referência apenas para `visit`; o mesmo padrão se
 * replica para `evidence`/`task`/`property`/`client` quando esses fluxos
 * de pull forem necessários (hoje o app resolve isso majoritariamente via
 * push + leitura direta dos endpoints REST de cada módulo).
 */
@Injectable()
export class SyncPullUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: SyncPullInput): Promise<SyncPullOutput> {
    const [cursorUpdatedAt, cursorId] = input.cursor ? input.cursor.split('_') : [undefined, undefined];

    const items = await this.prisma.visit.findMany({
      take: input.limit,
      orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
      where: cursorUpdatedAt
        ? {
            OR: [
              { updatedAt: { gt: new Date(cursorUpdatedAt) } },
              { updatedAt: new Date(cursorUpdatedAt), id: { gt: cursorId } },
            ],
          }
        : undefined,
    });

    const last = items[items.length - 1];
    const nextCursor = last ? `${last.updatedAt.toISOString()}_${last.id}` : null;

    return { items, nextCursor: items.length === input.limit ? nextCursor : null };
  }
}
