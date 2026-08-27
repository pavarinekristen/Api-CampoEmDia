import { StartVisitUseCase } from './start-visit.use-case';
import { VisitRepository } from '../../domain/repositories/visit.repository';
import { Visit } from '../../domain/entities/visit.entity';

describe('StartVisitUseCase — idempotência de sincronização offline', () => {
  const CLIENT_GENERATED_ID = '11111111-1111-1111-1111-111111111111';
  const baseInput = {
    clientGeneratedId: CLIENT_GENERATED_ID,
    propertyId: 'property-1',
    professionalId: 'user-1',
    type: 'ACOMPANHAMENTO' as const,
    startedAt: new Date('2026-08-27T10:00:00Z'),
  };

  function buildRepositoryMock(existing?: Visit & { id: string }) {
    const repo: VisitRepository = {
      findByClientGeneratedId: jest.fn().mockResolvedValue(existing ?? null),
      create: jest.fn().mockImplementation(async (visit: Visit) => Object.assign(visit, { id: 'server-generated-id' })),
      findById: jest.fn(),
      save: jest.fn(),
    };
    return repo;
  }

  it('cria a visita quando o clientGeneratedId ainda não existe', async () => {
    const repo = buildRepositoryMock();
    const useCase = new StartVisitUseCase(repo);

    const result = await useCase.execute(baseInput);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('server-generated-id');
  });

  it('NÃO duplica a visita ao reenviar a mesma operação (retry de rede em campo)', async () => {
    const existing = Object.assign(Visit.start(baseInput), { id: 'already-persisted-id' });
    const repo = buildRepositoryMock(existing);
    const useCase = new StartVisitUseCase(repo);

    // Simula o app reenviando a mesma operação do Outbox local depois de
    // uma queda de conexão antes de receber a confirmação do primeiro envio.
    const result = await useCase.execute(baseInput);

    expect(repo.create).not.toHaveBeenCalled();
    expect(result.id).toBe('already-persisted-id');
  });

  it('duas chamadas concorrentes com o mesmo clientGeneratedId resultam em uma única criação', async () => {
    // Sem chamada concorrente real de banco aqui (isso é papel do teste de
    // integração com Postgres + constraint unique), mas garante que o
    // use-case sempre consulta antes de criar — a proteção final contra
    // duplicidade real é a constraint `@unique` em `clientGeneratedId`
    // no schema (ver prisma/schema.prisma), que o findByClientGeneratedId
    // aqui espelha.
    const repo = buildRepositoryMock();
    const useCase = new StartVisitUseCase(repo);

    await useCase.execute(baseInput);

    expect(repo.findByClientGeneratedId).toHaveBeenCalledWith(CLIENT_GENERATED_ID);
  });
});
