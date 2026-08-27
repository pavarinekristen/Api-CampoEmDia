export class Lote {
  private constructor(
    readonly id: string | undefined,
    readonly propertyId: string,
    readonly name: string,
    readonly description: string | null,
  ) {}

  static create(params: { propertyId: string; name: string; description?: string }): Lote {
    if (params.name.trim().length < 2) {
      throw new Error('Nome do lote é obrigatório.');
    }
    return new Lote(undefined, params.propertyId, params.name.trim(), params.description ?? null);
  }

  static fromPersistence(row: {
    id: string;
    propertyId: string;
    name: string;
    description: string | null;
  }): Lote & { id: string } {
    return Object.assign(new Lote(row.id, row.propertyId, row.name, row.description), { id: row.id });
  }

  update(patch: { name?: string; description?: string }): Lote {
    const name = patch.name?.trim();
    if (name !== undefined && name.length < 2) {
      throw new Error('Nome do lote é obrigatório.');
    }
    return new Lote(this.id, this.propertyId, name ?? this.name, patch.description ?? this.description);
  }
}
