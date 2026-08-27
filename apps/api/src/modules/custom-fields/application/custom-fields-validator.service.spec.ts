import { BadRequestException } from '@nestjs/common';
import { CustomFieldsValidatorService } from './custom-fields-validator.service';
import { CustomFieldDefinition } from '../domain/entities/custom-field-definition.entity';
import { CustomFieldDefinitionRepository } from '../domain/repositories/custom-field-definition.repository';

describe('CustomFieldsValidatorService — motor de campos customizáveis', () => {
  function buildDefinitionsMock(definitions: Array<CustomFieldDefinition & { id: string }>) {
    const repo: CustomFieldDefinitionRepository = {
      findAllByEntityType: jest.fn().mockResolvedValue(definitions),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      createManySkippingDuplicates: jest.fn(),
    };
    return repo;
  }

  const numeroField = Object.assign(
    CustomFieldDefinition.create({
      tenantId: 't1',
      entityType: 'ANIMAL',
      key: 'peso_kg',
      label: 'Peso (kg)',
      fieldType: 'NUMERO',
      required: true,
    }),
    { id: 'def-1' },
  );

  const listaField = Object.assign(
    CustomFieldDefinition.create({
      tenantId: 't1',
      entityType: 'ANIMAL',
      key: 'categoria',
      label: 'Categoria',
      fieldType: 'LISTA',
      options: ['Cria', 'Recria', 'Engorda'],
    }),
    { id: 'def-2' },
  );

  it('retorna null quando não há definições e nenhum payload foi enviado', async () => {
    const service = new CustomFieldsValidatorService(buildDefinitionsMock([]));
    const result = await service.validate('ANIMAL', undefined);
    expect(result).toBeNull();
  });

  it('rejeita payload quando não existe nenhuma definição pra aquele entityType', async () => {
    const service = new CustomFieldsValidatorService(buildDefinitionsMock([]));
    await expect(service.validate('ANIMAL', { peso_kg: 10 })).rejects.toThrow(BadRequestException);
  });

  it('rejeita quando falta um campo obrigatório', async () => {
    const service = new CustomFieldsValidatorService(buildDefinitionsMock([numeroField]));
    await expect(service.validate('ANIMAL', {})).rejects.toThrow(/obrigatório ausente/);
  });

  it('rejeita chave desconhecida (sem definição correspondente)', async () => {
    const service = new CustomFieldsValidatorService(buildDefinitionsMock([numeroField]));
    await expect(service.validate('ANIMAL', { peso_kg: 10, campo_inventado: 'x' })).rejects.toThrow(/desconhecido/);
  });

  it('rejeita valor de tipo errado', async () => {
    const service = new CustomFieldsValidatorService(buildDefinitionsMock([numeroField]));
    await expect(service.validate('ANIMAL', { peso_kg: 'não é número' })).rejects.toThrow(/deve ser do tipo número/);
  });

  it('rejeita valor de LISTA fora das opções permitidas', async () => {
    const service = new CustomFieldsValidatorService(buildDefinitionsMock([listaField]));
    await expect(service.validate('ANIMAL', { categoria: 'Inexistente' })).rejects.toThrow(/deve ser uma das opções/);
  });

  it('aceita e retorna um payload válido', async () => {
    const service = new CustomFieldsValidatorService(buildDefinitionsMock([numeroField, listaField]));
    const result = await service.validate('ANIMAL', { peso_kg: 320, categoria: 'Recria' });
    expect(result).toEqual({ peso_kg: 320, categoria: 'Recria' });
  });
});
