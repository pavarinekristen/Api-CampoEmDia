import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CUSTOM_FIELD_DEFINITION_REPOSITORY,
  CustomFieldDefinitionRepository,
} from '../domain/repositories/custom-field-definition.repository';
import { CustomFieldEntityType, CustomFieldType } from '../domain/entities/custom-field-definition.entity';

/**
 * Peça central do motor de campos customizáveis — injetada em qualquer
 * use-case que salva um registro customizável (Cliente, Propriedade,
 * Visita, Animal). Nenhum módulo reimplementa esta validação.
 *
 * Contrato: rejeita chave sem definição correspondente (evita "lixo"
 * silencioso), garante presença de todo campo `required`, valida o tipo de
 * cada valor contra a definição do tenant. Retorna só as chaves conhecidas
 * (nunca ecoa de volta algo que não foi validado).
 */
@Injectable()
export class CustomFieldsValidatorService {
  constructor(
    @Inject(CUSTOM_FIELD_DEFINITION_REPOSITORY) private readonly definitions: CustomFieldDefinitionRepository,
  ) {}

  async validate(
    entityType: CustomFieldEntityType,
    payload: Record<string, unknown> | null | undefined,
  ): Promise<Record<string, unknown> | null> {
    const activeDefinitions = await this.definitions.findAllByEntityType(entityType, true);

    if (activeDefinitions.length === 0) {
      if (payload && Object.keys(payload).length > 0) {
        throw new BadRequestException(
          `Nenhum campo customizado foi definido para "${entityType}" — defina em POST /custom-fields antes de enviar valores.`,
        );
      }
      return null;
    }

    const result: Record<string, unknown> = {};
    const remainingKeys = new Set(Object.keys(payload ?? {}));

    for (const definition of activeDefinitions) {
      const value = (payload ?? {})[definition.key];
      remainingKeys.delete(definition.key);

      if (value === undefined || value === null) {
        if (definition.required) {
          throw new BadRequestException(`Campo customizado obrigatório ausente: "${definition.label}" (${definition.key}).`);
        }
        continue;
      }

      this.assertType(definition.key, definition.label, definition.fieldType, definition.options, value);
      result[definition.key] = value;
    }

    if (remainingKeys.size > 0) {
      throw new BadRequestException(`Campo(s) customizado(s) desconhecido(s): ${[...remainingKeys].join(', ')}.`);
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  private assertType(
    key: string,
    label: string,
    fieldType: CustomFieldType,
    options: string[] | null,
    value: unknown,
  ): void {
    switch (fieldType) {
      case 'TEXTO':
        if (typeof value !== 'string') throw this.typeError(label, key, 'texto');
        break;
      case 'NUMERO':
        if (typeof value !== 'number' || Number.isNaN(value)) throw this.typeError(label, key, 'número');
        break;
      case 'DATA':
        if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw this.typeError(label, key, 'data (ISO 8601)');
        break;
      case 'SIM_NAO':
        if (typeof value !== 'boolean') throw this.typeError(label, key, 'verdadeiro/falso');
        break;
      case 'LISTA':
        if (typeof value !== 'string' || !options?.includes(value)) {
          throw new BadRequestException(`Campo "${label}" (${key}) deve ser uma das opções: ${options?.join(', ')}.`);
        }
        break;
      case 'LISTA_MULTIPLA':
        if (!Array.isArray(value) || !value.every((v) => typeof v === 'string' && options?.includes(v))) {
          throw new BadRequestException(`Campo "${label}" (${key}) deve ser uma lista de opções entre: ${options?.join(', ')}.`);
        }
        break;
    }
  }

  private typeError(label: string, key: string, expected: string): BadRequestException {
    return new BadRequestException(`Campo "${label}" (${key}) deve ser do tipo ${expected}.`);
  }
}
