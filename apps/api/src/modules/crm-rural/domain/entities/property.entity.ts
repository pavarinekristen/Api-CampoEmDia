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
    );
  }
}
