import { NotFoundException } from '@nestjs/common';
import { ChangeAnimalStatusUseCase } from './change-animal-status.use-case';
import { Animal } from '../../domain/entities/animal.entity';
import { AnimalRepository } from '../../domain/repositories/animal.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

describe('ChangeAnimalStatusUseCase — regra de baixa do animal', () => {
  const activeAnimal = Object.assign(
    Animal.create({ propertyId: 'prop-1', identifier: '001', species: 'Bovino' }),
    { id: 'animal-1' },
  );

  function buildRepoMock(findByIdResult: (Animal & { id: string }) | null) {
    const repo: AnimalRepository = {
      findById: jest.fn().mockResolvedValue(findByIdResult),
      saveStatus: jest.fn().mockImplementation(async (animal) => animal),
      create: jest.fn(),
      findAllPaginated: jest.fn(),
      findAllByProperty: jest.fn(),
      update: jest.fn(),
    };
    return repo;
  }

  function buildAuditMock() {
    return { record: jest.fn().mockResolvedValue(undefined) } as unknown as AuditLogService;
  }

  it('dá baixa num animal ATIVO e grava auditoria', async () => {
    const repo = buildRepoMock(activeAnimal);
    const audit = buildAuditMock();
    const useCase = new ChangeAnimalStatusUseCase(repo, audit);

    const result = await useCase.execute({ animalId: 'animal-1', status: 'VENDIDO', reason: 'Venda para terceiros', at: new Date() });

    expect(result.status).toBe('VENDIDO');
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ entity: 'Animal', action: 'CHANGE_STATUS' }));
  });

  it('rejeita dar baixa num animal que já está fora de ATIVO', async () => {
    const alreadySold = activeAnimal.changeStatus('VENDIDO', undefined, new Date());
    const repo = buildRepoMock(Object.assign(alreadySold, { id: 'animal-1' }));
    const useCase = new ChangeAnimalStatusUseCase(repo, buildAuditMock());

    await expect(
      useCase.execute({ animalId: 'animal-1', status: 'MORTO', at: new Date() }),
    ).rejects.toThrow('Não é possível alterar o status de um animal que já está "VENDIDO".');
  });

  it('lança NotFoundException quando o animal não existe', async () => {
    const repo = buildRepoMock(null);
    const useCase = new ChangeAnimalStatusUseCase(repo, buildAuditMock());

    await expect(useCase.execute({ animalId: 'nao-existe', status: 'MORTO', at: new Date() })).rejects.toThrow(
      NotFoundException,
    );
  });
});
