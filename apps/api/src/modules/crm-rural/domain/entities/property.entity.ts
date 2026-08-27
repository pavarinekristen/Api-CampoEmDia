export class Property {
  private constructor(
    readonly id: string | undefined,
    readonly clientId: string,
    readonly name: string,
    readonly location: string | null,
    readonly latitude: number | null,
    readonly longitude: number | null,
    readonly activities: string | null,
    readonly frequency: string | null,
    readonly version: number,
  ) {}

  static create(params: {
    clientId: string;
    name: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    activities?: string;
    frequency?: string;
  }): Property {
    if (params.name.trim().length < 2) {
      throw new Error('Nome da propriedade é obrigatório.');
    }
    return new Property(
      undefined,
      params.clientId,
      params.name.trim(),
      params.location ?? null,
      params.latitude ?? null,
      params.longitude ?? null,
      params.activities ?? null,
      params.frequency ?? null,
      1,
    );
  }

  static fromPersistence(row: {
    id: string;
    clientId: string;
    name: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    activities: string | null;
    frequency: string | null;
    version: number;
  }): Property & { id: string } {
    return Object.assign(
      new Property(
        row.id,
        row.clientId,
        row.name,
        row.location,
        row.latitude,
        row.longitude,
        row.activities,
        row.frequency,
        row.version,
      ),
      { id: row.id },
    );
  }
}
