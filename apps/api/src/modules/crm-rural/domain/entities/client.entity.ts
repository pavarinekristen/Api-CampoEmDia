export class Client {
  private constructor(
    readonly id: string | undefined,
    readonly name: string,
    readonly contact: string | null,
    readonly notes: string | null,
    readonly version: number,
    readonly customFields: Record<string, unknown> | null,
  ) {}

  static create(params: {
    name: string;
    contact?: string;
    notes?: string;
    customFields?: Record<string, unknown> | null;
  }): Client {
    if (params.name.trim().length < 2) {
      throw new Error('Nome do cliente é obrigatório.');
    }
    return new Client(
      undefined,
      params.name.trim(),
      params.contact ?? null,
      params.notes ?? null,
      1,
      params.customFields ?? null,
    );
  }

  static fromPersistence(row: {
    id: string;
    name: string;
    contact: string | null;
    notes: string | null;
    version: number;
    customFields: unknown;
  }): Client & { id: string } {
    return Object.assign(
      new Client(row.id, row.name, row.contact, row.notes, row.version, (row.customFields as Record<string, unknown>) ?? null),
      { id: row.id },
    );
  }
}
