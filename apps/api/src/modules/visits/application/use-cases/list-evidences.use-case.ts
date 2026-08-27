import { Inject, Injectable } from '@nestjs/common';
import { EVIDENCE_REPOSITORY, EvidenceRepository } from '../../domain/repositories/evidence.repository';
import { StorageService } from '../../../../infra/storage/storage.service';

/**
 * Hoje não existe nenhuma forma de reobter o link de uma foto/áudio já
 * enviado — o cliente só recebe a `storageKey` no momento do upload. Este
 * use-case fecha essa lacuna: mesmo padrão de URL assinada de curta
 * duração usado em `reports/interface/reports.controller.ts`.
 */
@Injectable()
export class ListEvidencesUseCase {
  constructor(
    @Inject(EVIDENCE_REPOSITORY) private readonly evidences: EvidenceRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(visitId: string) {
    const items = await this.evidences.findByVisitId(visitId);
    return Promise.all(
      items.map(async (evidence) => ({
        ...evidence,
        viewUrl: evidence.storageKey ? await this.storage.createDownloadUrl(evidence.storageKey, 3600) : null,
      })),
    );
  }
}
