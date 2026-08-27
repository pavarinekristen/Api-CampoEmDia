/**
 * Base para eventos de domínio publicados por agregados (ex: VisitEndedEvent).
 * Consumidos internamente via EventEmitter do Nest para desacoplar módulos
 * (ex: `visits` não conhece `reports` diretamente — apenas emite o evento;
 * `reports` escuta e enfileira o job de geração de PDF).
 */
export abstract class DomainEvent {
  readonly occurredAt: Date = new Date();
  abstract readonly eventName: string;
}
