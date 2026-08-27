export type EvidenceType = 'TEXTO' | 'AUDIO' | 'FOTO' | 'VIDEO' | 'DOCUMENTO';

export class Evidence {
  private constructor(
    readonly id: string | undefined,
    readonly clientGeneratedId: string,
    readonly visitId: string,
    readonly type: EvidenceType,
    readonly storageKey: string | null,
    readonly mimeType: string | null,
    readonly sizeBytes: number | null,
    readonly note: string | null,
    readonly transcriptDraft: string | null,
    readonly transcriptReviewed: boolean,
  ) {}

  static register(params: {
    clientGeneratedId: string;
    visitId: string;
    type: EvidenceType;
    storageKey?: string;
    mimeType?: string;
    sizeBytes?: number;
    note?: string;
  }): Evidence {
    if ((params.type === 'FOTO' || params.type === 'VIDEO' || params.type === 'AUDIO' || params.type === 'DOCUMENTO') && !params.storageKey) {
      throw new Error(`Evidência do tipo "${params.type}" requer um arquivo (storageKey).`);
    }
    return new Evidence(
      undefined,
      params.clientGeneratedId,
      params.visitId,
      params.type,
      params.storageKey ?? null,
      params.mimeType ?? null,
      params.sizeBytes ?? null,
      params.note ?? null,
      null,
      false,
    );
  }

  /**
   * Aplicada pelo worker de transcrição — nunca marca `transcriptReviewed`
   * automaticamente. A confirmação humana é um requisito de produto
   * explícito (revisão obrigatória de conteúdo organizado por IA).
   */
  attachTranscriptDraft(draft: string): Evidence {
    return new Evidence(
      this.id,
      this.clientGeneratedId,
      this.visitId,
      this.type,
      this.storageKey,
      this.mimeType,
      this.sizeBytes,
      this.note,
      draft,
      false,
    );
  }
}
