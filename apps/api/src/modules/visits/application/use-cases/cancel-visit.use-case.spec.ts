import { CancelVisitUseCase } from './cancel-visit.use-case';
import { VisitRepository } from '../../domain/repositories/visit.repository';
import { Visit } from '../../domain/entities/visit.entity';
import { NotFoundException } from '@nestjs/common';

describe('CancelVisitUseCase — regra de transição de status', () => {
  const baseVisit = Visit.start({
    clientGeneratedId: 'cgid-1',
    propertyId: 'property-1',
    professionalId: 'user-1',
    type: 'ACOMPANHAMENTO',
    startedAt: new Date('2026-08-27T10:00:00Z'),
  });

  function buildRepoMock(existing: (Visit & { id: string }) | null) {
    const repo: VisitRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      save: jest.fn().mockImplementation(async (visit) => visit),
      create: jest.fn(),
      findByClientGeneratedId: jest.fn(),
      findAllByTenant: jest.fn(),
    };
    return repo;
  }

  function buildAuditMock() {
    return { record: jest.fn().mockResolvedValue(undefined) } as unknown as import('../../../../infra/audit/audit-log.service').AuditLogService;
  }

  it('cancela uma visita EM_ANDAMENTO e grava auditoria', async () => {
    const existing = Object.assign(baseVisit, { id: 'visit-1' });
    const repo = buildRepoMock(existing);
    const audit = buildAuditMock();
    const useCase = new CancelVisitUseCase(repo, audit);

    const result = await useCase.execute('visit-1');

    expect(result.status).toBe('CANCELADA');
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ entity: 'Visit', entityId: 'visit-1', action: 'CANCEL' }),
    );
  });

  it('rejeita cancelar uma visita já ENCERRADA', async () => {
    const ended = Object.assign(baseVisit.end({ endedAt: new Date() }), { id: 'visit-2' });
    const repo = buildRepoMock(ended);
    const useCase = new CancelVisitUseCase(repo, buildAuditMock());

    await expect(useCase.execute('visit-2')).rejects.toThrow(
      'Não é possível cancelar uma visita com status "ENCERRADA".',
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando a visita não existe', async () => {
    const repo = buildRepoMock(null);
    const useCase = new CancelVisitUseCase(repo, buildAuditMock());

    await expect(useCase.execute('nao-existe')).rejects.toThrow(NotFoundException);
  });
});
