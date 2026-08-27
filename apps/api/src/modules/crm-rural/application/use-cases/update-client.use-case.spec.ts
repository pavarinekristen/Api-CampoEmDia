import { UpdateClientUseCase } from './update-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { Client } from '../../domain/entities/client.entity';
import { CustomFieldsValidatorService } from '../../../custom-fields/application/custom-fields-validator.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UpdateClientUseCase — soft delete e concorrência otimista', () => {
  const existingClient = Client.fromPersistence({
    id: 'client-1',
    name: 'Fazenda Boa Vista',
    contact: null,
    notes: null,
    version: 3,
    customFields: null,
  });

  function buildRepoMock(params: { findByIdResult: (Client & { id: string }) | null; updateResult: 'CONFLICT' | (Client & { id: string }) }) {
    const repo: ClientRepository = {
      findById: jest.fn().mockResolvedValue(params.findByIdResult),
      update: jest.fn().mockResolvedValue(params.updateResult),
      create: jest.fn(),
      findAllPaginated: jest.fn(),
      softDelete: jest.fn(),
    };
    return repo;
  }

  function buildAuditMock() {
    return { record: jest.fn().mockResolvedValue(undefined) } as unknown as import('../../../../infra/audit/audit-log.service').AuditLogService;
  }

  function buildCustomFieldsValidatorMock() {
    return { validate: jest.fn().mockResolvedValue(null) } as unknown as CustomFieldsValidatorService;
  }

  it('atualiza o cliente quando a versão informada bate com a atual', async () => {
    const updated = Client.fromPersistence({ ...existingClient, name: 'Novo Nome', version: 4, customFields: null });
    const repo = buildRepoMock({ findByIdResult: existingClient, updateResult: updated });
    const audit = buildAuditMock();
    const useCase = new UpdateClientUseCase(repo, audit, buildCustomFieldsValidatorMock());

    const result = await useCase.execute({ clientId: 'client-1', name: 'Novo Nome', version: 3 });

    expect(result.name).toBe('Novo Nome');
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ entity: 'Client', action: 'UPDATE' }));
  });

  it('lança ConflictException (409) quando a versão informada não bate mais', async () => {
    const repo = buildRepoMock({ findByIdResult: existingClient, updateResult: 'CONFLICT' });
    const useCase = new UpdateClientUseCase(repo, buildAuditMock(), buildCustomFieldsValidatorMock());

    await expect(useCase.execute({ clientId: 'client-1', name: 'Outro Nome', version: 1 })).rejects.toThrow(
      ConflictException,
    );
  });

  it('lança NotFoundException para cliente inexistente ou já desativado (soft-deleted)', async () => {
    // findById já filtra deletedAt != null no repositório real — aqui simulamos
    // o efeito retornando null, como aconteceria para um cliente soft-deleted.
    const repo = buildRepoMock({ findByIdResult: null, updateResult: 'CONFLICT' });
    const useCase = new UpdateClientUseCase(repo, buildAuditMock(), buildCustomFieldsValidatorMock());

    await expect(useCase.execute({ clientId: 'client-inexistente', name: 'X' })).rejects.toThrow(NotFoundException);
  });
});
