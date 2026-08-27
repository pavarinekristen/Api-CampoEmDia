export type HealthEventType = 'VACINACAO' | 'MEDICAMENTO' | 'EXAME' | 'PROCEDIMENTO' | 'REPRODUCAO';
export type PregnancyStatus = 'NAO_CONFIRMADA' | 'CONFIRMADA' | 'PERDIDA';

/**
 * Aditivo por natureza — mesma filosofia de Evidence (visits): um evento
 * sanitário não é editado depois de criado, só criado. Se foi um erro de
 * registro, cria-se um novo evento com a correção; o histórico nunca some.
 */
export class AnimalHealthEvent {
  private constructor(
    readonly id: string | undefined,
    readonly animalId: string,
    readonly visitId: string | null,
    readonly type: HealthEventType,
    readonly description: string,
    readonly productName: string | null,
    readonly doseInfo: string | null,
    readonly appliedById: string | null,
    readonly appliedAt: Date,
    readonly withdrawalUntil: Date | null,
    readonly nextDueDate: Date | null,
    readonly pregnancyStatus: PregnancyStatus | null,
    readonly expectedBirthDate: Date | null,
    readonly notes: string | null,
    readonly customFields: Record<string, unknown> | null,
  ) {}

  static create(params: {
    animalId: string;
    visitId?: string;
    type: HealthEventType;
    description: string;
    productName?: string;
    doseInfo?: string;
    appliedById?: string;
    appliedAt: Date;
    withdrawalUntil?: Date;
    nextDueDate?: Date;
    pregnancyStatus?: PregnancyStatus;
    expectedBirthDate?: Date;
    notes?: string;
    customFields?: Record<string, unknown> | null;
  }): AnimalHealthEvent {
    if (params.description.trim().length < 2) {
      throw new Error('Descrição do evento sanitário é obrigatória.');
    }
    return new AnimalHealthEvent(
      undefined,
      params.animalId,
      params.visitId ?? null,
      params.type,
      params.description.trim(),
      params.productName ?? null,
      params.doseInfo ?? null,
      params.appliedById ?? null,
      params.appliedAt,
      params.withdrawalUntil ?? null,
      params.nextDueDate ?? null,
      params.pregnancyStatus ?? null,
      params.expectedBirthDate ?? null,
      params.notes ?? null,
      params.customFields ?? null,
    );
  }

  static fromPersistence(row: {
    id: string;
    animalId: string;
    visitId: string | null;
    type: HealthEventType;
    description: string;
    productName: string | null;
    doseInfo: string | null;
    appliedById: string | null;
    appliedAt: Date;
    withdrawalUntil: Date | null;
    nextDueDate: Date | null;
    pregnancyStatus: PregnancyStatus | null;
    expectedBirthDate: Date | null;
    notes: string | null;
    customFields: unknown;
  }): AnimalHealthEvent & { id: string } {
    return Object.assign(
      new AnimalHealthEvent(
        row.id,
        row.animalId,
        row.visitId,
        row.type,
        row.description,
        row.productName,
        row.doseInfo,
        row.appliedById,
        row.appliedAt,
        row.withdrawalUntil,
        row.nextDueDate,
        row.pregnancyStatus,
        row.expectedBirthDate,
        row.notes,
        (row.customFields as Record<string, unknown>) ?? null,
      ),
      { id: row.id },
    );
  }
}
