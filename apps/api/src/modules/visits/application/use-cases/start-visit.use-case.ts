import { Inject, Injectable } from '@nestjs/common';
import { Visit, VisitType } from '../../domain/entities/visit.entity';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';
import { CustomFieldsValidatorService } from '../../../custom-fields/application/custom-fields-validator.service';

export interface StartVisitInput {
  clientGeneratedId: string;
  propertyId: string;
  professionalId: string;
  type: VisitType;
  startedAt: Date;
  customFields?: Record<string, unknown>;
}

@Injectable()
export class StartVisitUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository,
    private readonly customFieldsValidator: CustomFieldsValidatorService,
  ) {}

  async execute(input: StartVisitInput) {
    // Idempotência: se esta visita já foi sincronizada antes (retry de
    // rede em conexão instável), retorna o registro existente em vez de
    // duplicar — mesma lógica aplicada pelo motor de sync (módulo `sync`).
    // Não revalida customFields aqui: é um retry da mesma operação já
    // aplicada, não uma nova criação.
    const existing = await this.visits.findByClientGeneratedId(input.clientGeneratedId);
    if (existing) return existing;

    const customFields = await this.customFieldsValidator.validate('VISIT', input.customFields);
    const visit = Visit.start({ ...input, customFields });
    return this.visits.create(visit);
  }
}
