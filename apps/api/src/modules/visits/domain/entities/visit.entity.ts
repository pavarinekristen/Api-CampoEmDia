export type VisitType =
  | 'ACOMPANHAMENTO'
  | 'EMERGENCIA'
  | 'RETORNO'
  | 'COLETA'
  | 'VACINACAO'
  | 'REPRODUCAO'
  | 'AVALIACAO_PRODUTIVA'
  | 'VISTORIA'
  | 'CONSULTORIA';

export type VisitStatus = 'EM_ANDAMENTO' | 'ENCERRADA' | 'CANCELADA';

export class Visit {
  private constructor(
    readonly id: string | undefined,
    readonly clientGeneratedId: string,
    readonly propertyId: string,
    readonly professionalId: string,
    readonly type: VisitType,
    readonly status: VisitStatus,
    readonly startedAt: Date,
    readonly endedAt: Date | null,
    readonly summary: string | null,
  ) {}

  static start(params: {
    clientGeneratedId: string;
    propertyId: string;
    professionalId: string;
    type: VisitType;
    startedAt: Date;
  }): Visit {
    return new Visit(
      undefined,
      params.clientGeneratedId,
      params.propertyId,
      params.professionalId,
      params.type,
      'EM_ANDAMENTO',
      params.startedAt,
      null,
      null,
    );
  }

  /**
   * Regra de negócio: só é possível encerrar uma visita que está em
   * andamento. Uma visita já encerrada ou cancelada é imutável — qualquer
   * correção deveria virar uma nova visita de retorno, preservando o
   * histórico (rastreabilidade é um requisito central do produto).
   */
  end(params: { endedAt: Date; summary?: string }): Visit {
    if (this.status !== 'EM_ANDAMENTO') {
      throw new Error(`Não é possível encerrar uma visita com status "${this.status}".`);
    }
    return new Visit(
      this.id,
      this.clientGeneratedId,
      this.propertyId,
      this.professionalId,
      this.type,
      'ENCERRADA',
      this.startedAt,
      params.endedAt,
      params.summary ?? this.summary,
    );
  }

  /**
   * Cancelamento — diferente de encerramento: significa que a visita não
   * aconteceu de fato (não gera relatório). Só é possível a partir de
   * `EM_ANDAMENTO`, mesma regra de `end()`.
   */
  cancel(): Visit {
    if (this.status !== 'EM_ANDAMENTO') {
      throw new Error(`Não é possível cancelar uma visita com status "${this.status}".`);
    }
    return new Visit(
      this.id,
      this.clientGeneratedId,
      this.propertyId,
      this.professionalId,
      this.type,
      'CANCELADA',
      this.startedAt,
      this.endedAt,
      this.summary,
    );
  }

  static fromPersistence(row: {
    id: string;
    clientGeneratedId: string;
    propertyId: string;
    professionalId: string;
    type: VisitType;
    status: VisitStatus;
    startedAt: Date;
    endedAt: Date | null;
    summary: string | null;
  }): Visit & { id: string } {
    return Object.assign(
      new Visit(
        row.id,
        row.clientGeneratedId,
        row.propertyId,
        row.professionalId,
        row.type,
        row.status,
        row.startedAt,
        row.endedAt,
        row.summary,
      ),
      { id: row.id },
    );
  }
}
