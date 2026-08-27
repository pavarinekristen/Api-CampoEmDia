export type CustomFieldEntityType = 'CLIENT' | 'PROPERTY' | 'VISIT' | 'ANIMAL';
export type CustomFieldType = 'TEXTO' | 'NUMERO' | 'DATA' | 'SIM_NAO' | 'LISTA' | 'LISTA_MULTIPLA';

const KEY_REGEX = /^[a-z][a-z0-9_]*$/;
const LIST_TYPES: CustomFieldType[] = ['LISTA', 'LISTA_MULTIPLA'];

export class CustomFieldDefinition {
  private constructor(
    readonly id: string | undefined,
    readonly tenantId: string,
    readonly entityType: CustomFieldEntityType,
    readonly key: string,
    readonly label: string,
    readonly fieldType: CustomFieldType,
    readonly options: string[] | null,
    readonly required: boolean,
    readonly order: number,
    readonly active: boolean,
  ) {}

  static create(params: {
    tenantId: string;
    entityType: CustomFieldEntityType;
    key: string;
    label: string;
    fieldType: CustomFieldType;
    options?: string[];
    required?: boolean;
    order?: number;
  }): CustomFieldDefinition {
    if (!KEY_REGEX.test(params.key)) {
      throw new Error('A chave do campo deve ser minúscula, começar com letra e usar apenas letras/números/underscore.');
    }
    if (params.label.trim().length < 2) {
      throw new Error('Rótulo do campo é obrigatório.');
    }
    if (LIST_TYPES.includes(params.fieldType) && (!params.options || params.options.length === 0)) {
      throw new Error(`Campo do tipo "${params.fieldType}" precisa de ao menos uma opção.`);
    }
    return new CustomFieldDefinition(
      undefined,
      params.tenantId,
      params.entityType,
      params.key,
      params.label.trim(),
      params.fieldType,
      params.options ?? null,
      params.required ?? false,
      params.order ?? 0,
      true,
    );
  }

  static fromPersistence(row: {
    id: string;
    tenantId: string;
    entityType: CustomFieldEntityType;
    key: string;
    label: string;
    fieldType: CustomFieldType;
    options: unknown;
    required: boolean;
    order: number;
    active: boolean;
  }): CustomFieldDefinition & { id: string } {
    return Object.assign(
      new CustomFieldDefinition(
        row.id,
        row.tenantId,
        row.entityType,
        row.key,
        row.label,
        row.fieldType,
        (row.options as string[] | null) ?? null,
        row.required,
        row.order,
        row.active,
      ),
      { id: row.id },
    );
  }

  update(patch: { label?: string; options?: string[]; required?: boolean; order?: number }): CustomFieldDefinition {
    const label = patch.label?.trim();
    if (label !== undefined && label.length < 2) {
      throw new Error('Rótulo do campo é obrigatório.');
    }
    const options = patch.options ?? this.options ?? undefined;
    if (LIST_TYPES.includes(this.fieldType) && (!options || options.length === 0)) {
      throw new Error(`Campo do tipo "${this.fieldType}" precisa de ao menos uma opção.`);
    }
    return new CustomFieldDefinition(
      this.id,
      this.tenantId,
      this.entityType,
      this.key,
      label ?? this.label,
      this.fieldType,
      options ?? null,
      patch.required ?? this.required,
      patch.order ?? this.order,
      this.active,
    );
  }

  deactivate(): CustomFieldDefinition {
    if (!this.active) {
      throw new Error('Este campo já está desativado.');
    }
    return new CustomFieldDefinition(
      this.id,
      this.tenantId,
      this.entityType,
      this.key,
      this.label,
      this.fieldType,
      this.options,
      this.required,
      this.order,
      false,
    );
  }
}
