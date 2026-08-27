import { DomainEvent } from '../../../../shared-kernel/domain/domain-event';

/**
 * Publicado ao encerrar uma visita. O módulo `reports` escuta este evento
 * e enfileira o job de geração de PDF — `visits` não conhece `reports`
 * diretamente, mantendo a fronteira entre módulos do monólito modular.
 */
export class VisitEndedEvent extends DomainEvent {
  readonly eventName = 'visit.ended';

  constructor(
    readonly visitId: string,
    readonly tenantId: string,
  ) {
    super();
  }
}
