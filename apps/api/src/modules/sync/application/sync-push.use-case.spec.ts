import { Prisma } from '@prisma/client';
import { SyncPushUseCase } from './sync-push.use-case';

describe('SyncPushUseCase — aplicação idempotente de operações em lote', () => {
  function buildUseCase(startVisitImpl: jest.Mock) {
    const startVisit = { execute: startVisitImpl } as never;
    const addEvidence = { execute: jest.fn() } as never;
    const createTask = { execute: jest.fn() } as never;
    return new SyncPushUseCase(startVisit, addEvidence, createTask);
  }

  it('retorna APPLIED quando a operação é criada com sucesso', async () => {
    const useCase = buildUseCase(jest.fn().mockResolvedValue({ id: 'visit-1' }));

    const [result] = await useCase.execute([
      {
        idempotencyKey: 'op-1',
        entity: 'visit',
        operation: 'CREATE',
        payload: {
          clientGeneratedId: 'cgid-1',
          propertyId: 'property-1',
          professionalId: 'user-1',
          type: 'ACOMPANHAMENTO',
          startedAt: '2026-08-27T10:00:00Z',
        },
      },
    ]);

    expect(result).toEqual({ idempotencyKey: 'op-1', status: 'APPLIED', serverEntityId: 'visit-1' });
  });

  it('retorna DUPLICATE (não REJECTED) quando o reenvio colide com a constraint unique de clientGeneratedId', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
    const useCase = buildUseCase(jest.fn().mockRejectedValue(prismaError));

    const [result] = await useCase.execute([
      {
        idempotencyKey: 'op-retry',
        entity: 'visit',
        operation: 'CREATE',
        payload: {
          clientGeneratedId: 'cgid-1',
          propertyId: 'property-1',
          professionalId: 'user-1',
          type: 'ACOMPANHAMENTO',
          startedAt: '2026-08-27T10:00:00Z',
        },
      },
    ]);

    // Este é o comportamento que garante que reenviar o mesmo lote depois
    // de uma conexão instável no campo NUNCA duplica a visita, mesmo que o
    // use-case de idempotência por-clientGeneratedId falhe por alguma
    // razão e a criação chegue a ser tentada duas vezes no banco.
    expect(result.status).toBe('DUPLICATE');
  });

  it('rejeita entidades property/client como fora do escopo desta versão', async () => {
    const useCase = buildUseCase(jest.fn());

    const [result] = await useCase.execute([
      { idempotencyKey: 'op-2', entity: 'client', operation: 'CREATE', payload: {} },
    ]);

    expect(result.status).toBe('REJECTED');
  });
});
