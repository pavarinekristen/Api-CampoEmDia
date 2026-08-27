export type AnimalSex = 'MACHO' | 'FEMEA';
export type AnimalStatus = 'ATIVO' | 'VENDIDO' | 'MORTO' | 'DESCARTADO';

export class Animal {
  private constructor(
    readonly id: string | undefined,
    readonly propertyId: string,
    readonly loteId: string | null,
    readonly identifier: string,
    readonly name: string | null,
    readonly species: string,
    readonly breed: string | null,
    readonly sex: AnimalSex | null,
    readonly birthDate: Date | null,
    readonly status: AnimalStatus,
    readonly statusReason: string | null,
    readonly statusAt: Date | null,
    readonly customFields: Record<string, unknown> | null,
    readonly version: number,
  ) {}

  static create(params: {
    propertyId: string;
    loteId?: string;
    identifier: string;
    name?: string;
    species: string;
    breed?: string;
    sex?: AnimalSex;
    birthDate?: Date;
    customFields?: Record<string, unknown> | null;
  }): Animal {
    if (params.identifier.trim().length < 1) {
      throw new Error('Identificação do animal (brinco/número) é obrigatória.');
    }
    if (params.species.trim().length < 2) {
      throw new Error('Espécie do animal é obrigatória.');
    }
    return new Animal(
      undefined,
      params.propertyId,
      params.loteId ?? null,
      params.identifier.trim(),
      params.name?.trim() ?? null,
      params.species.trim(),
      params.breed ?? null,
      params.sex ?? null,
      params.birthDate ?? null,
      'ATIVO',
      null,
      null,
      params.customFields ?? null,
      1,
    );
  }

  static fromPersistence(row: {
    id: string;
    propertyId: string;
    loteId: string | null;
    identifier: string;
    name: string | null;
    species: string;
    breed: string | null;
    sex: AnimalSex | null;
    birthDate: Date | null;
    status: AnimalStatus;
    statusReason: string | null;
    statusAt: Date | null;
    customFields: unknown;
    version: number;
  }): Animal & { id: string } {
    return Object.assign(
      new Animal(
        row.id,
        row.propertyId,
        row.loteId,
        row.identifier,
        row.name,
        row.species,
        row.breed,
        row.sex,
        row.birthDate,
        row.status,
        row.statusReason,
        row.statusAt,
        (row.customFields as Record<string, unknown>) ?? null,
        row.version,
      ),
      { id: row.id },
    );
  }

  update(patch: {
    identifier?: string;
    loteId?: string;
    name?: string;
    species?: string;
    breed?: string;
    sex?: AnimalSex;
    birthDate?: Date;
    customFields?: Record<string, unknown> | null;
  }): Animal {
    const identifier = patch.identifier?.trim();
    if (identifier !== undefined && identifier.length < 1) {
      throw new Error('Identificação do animal (brinco/número) é obrigatória.');
    }
    const species = patch.species?.trim();
    if (species !== undefined && species.length < 2) {
      throw new Error('Espécie do animal é obrigatória.');
    }
    return new Animal(
      this.id,
      this.propertyId,
      patch.loteId ?? this.loteId,
      identifier ?? this.identifier,
      patch.name?.trim() ?? this.name,
      species ?? this.species,
      patch.breed ?? this.breed,
      patch.sex ?? this.sex,
      patch.birthDate ?? this.birthDate,
      this.status,
      this.statusReason,
      this.statusAt,
      patch.customFields !== undefined ? patch.customFields : this.customFields,
      this.version,
    );
  }

  /**
   * Baixa do animal — vendido, morto ou descartado. Regra: só é possível
   * mudar status a partir de ATIVO; uma vez fora do rebanho ativo, o
   * registro fica congelado (mesma filosofia de Visit.end()/cancel()).
   */
  changeStatus(status: AnimalStatus, reason: string | undefined, at: Date): Animal {
    if (this.status !== 'ATIVO') {
      throw new Error(`Não é possível alterar o status de um animal que já está "${this.status}".`);
    }
    if (status === 'ATIVO') {
      throw new Error('Use update() para alterar dados do animal — "ATIVO" não é uma baixa.');
    }
    return new Animal(
      this.id,
      this.propertyId,
      this.loteId,
      this.identifier,
      this.name,
      this.species,
      this.breed,
      this.sex,
      this.birthDate,
      status,
      reason ?? null,
      at,
      this.customFields,
      this.version,
    );
  }
}
