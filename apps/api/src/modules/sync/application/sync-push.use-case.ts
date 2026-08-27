import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StartVisitUseCase } from '../../visits/application/use-cases/start-visit.use-case';
import { AddEvidenceUseCase } from '../../visits/application/use-cases/add-evidence.use-case';
import { CreateTaskUseCase } from '../../visits/application/use-cases/create-task.use-case';

export interface SyncOperationInput {
  idempotencyKey: string;
  entity: 'visit' | 'evidence' | 'task' | 'property' | 'client';
  operation: 'CREATE' | 'UPDATE';
  payload: Record<string, unknown>;
}

export type SyncPushStatus = 'APPLIED' | 'DUPLICATE' | 'CONFLICT' | 'REJECTED';

export interface SyncPushResult {
  idempotencyKey: string;
  status: SyncPushStatus;
  serverEntityId?: string;
  reason?: string;
}

/**
 * Aplica em lote as operações enfileiradas no dispositivo enquanto offline
 * (padrão Outbox — ver plano arquitetural, seção Sincronização Offline).
 *
 * Cada operação é aplicada de forma independente e idempotente: reenviar
 * o mesmo lote (ex: depois de uma queda de conexão a meio da resposta)
 * nunca duplica dados, porque a idempotência real é garantida pelo
 * `clientGeneratedId` único de cada entidade (gerado no dispositivo), não
 * pelo `idempotencyKey` do envelope de sincronização — o `idempotencyKey`
 * aqui serve apenas para correlacionar a operação à resposta.
 *
 * Escopo desta versão: `visit`, `evidence` e `task`, que são as entidades
 * com maior volume de criação offline e cujo schema já carrega
 * `clientGeneratedId`. `property`/`client` tipicamente são cadastrados com
 * conectividade (escritório/primeira visita) e ficam fora do sync
 * automático nesta versão — ver README para o racional completo.
 */
@Injectable()
export class SyncPushUseCase {
  private readonly logger = new Logger(SyncPushUseCase.name);

  constructor(
    private readonly startVisit: StartVisitUseCase,
    private readonly addEvidence: AddEvidenceUseCase,
    private readonly createTask: CreateTaskUseCase,
  ) {}

  async execute(operations: SyncOperationInput[]): Promise<SyncPushResult[]> {
    const results: SyncPushResult[] = [];
    for (const op of operations) {
      results.push(await this.applyOne(op));
    }
    return results;
  }

  private async applyOne(op: SyncOperationInput): Promise<SyncPushResult> {
    try {
      switch (op.entity) {
        case 'visit': {
          const p = op.payload as {
            clientGeneratedId: string;
            propertyId: string;
            professionalId: string;
            type: string;
            startedAt: string;
          };
          const result = await this.startVisit.execute({
            clientGeneratedId: p.clientGeneratedId,
            propertyId: p.propertyId,
            professionalId: p.professionalId,
            type: p.type as never,
            startedAt: new Date(p.startedAt),
          });
          return { idempotencyKey: op.idempotencyKey, status: 'APPLIED', serverEntityId: result.id };
        }
        case 'evidence': {
          const p = op.payload as {
            clientGeneratedId: string;
            visitId: string;
            type: string;
            storageKey?: string;
            mimeType?: string;
            sizeBytes?: number;
            note?: string;
          };
          const result = await this.addEvidence.execute({ ...p, type: p.type as never });
          return { idempotencyKey: op.idempotencyKey, status: 'APPLIED', serverEntityId: result.id };
        }
        case 'task': {
          const p = op.payload as {
            clientGeneratedId: string;
            visitId: string;
            description: string;
            assigneeId?: string;
            dueDate?: string;
            priority?: string;
            requiresReturnVisit?: boolean;
            evidenceExpected?: string;
          };
          const result = await this.createTask.execute({
            ...p,
            priority: p.priority as never,
            dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
          });
          return { idempotencyKey: op.idempotencyKey, status: 'APPLIED', serverEntityId: result.id };
        }
        case 'property':
        case 'client':
          return {
            idempotencyKey: op.idempotencyKey,
            status: 'REJECTED',
            reason: `Sincronização offline para "${op.entity}" fora do escopo desta versão — cadastre via painel web ou API síncrona.`,
          };
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Violação da constraint unique de clientGeneratedId — a operação
        // já havia sido aplicada num envio anterior (retry de rede).
        return { idempotencyKey: op.idempotencyKey, status: 'DUPLICATE' };
      }
      this.logger.warn(`Falha ao aplicar operação de sync (${op.entity}): ${(error as Error).message}`);
      return { idempotencyKey: op.idempotencyKey, status: 'REJECTED', reason: (error as Error).message };
    }
  }
}
