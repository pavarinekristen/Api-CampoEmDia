import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { tenantContext } from '../../../../common/context/tenant-context';
import { VISIT_REPOSITORY, VisitRepository } from '../../domain/repositories/visit.repository';
import { VisitEndedEvent } from '../../domain/events/visit-ended.event';

export interface EndVisitInput {
  visitId: string;
  endedAt: Date;
  summary?: string;
}

@Injectable()
export class EndVisitUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY) private readonly visits: VisitRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute(input: EndVisitInput) {
    const visit = await this.visits.findById(input.visitId);
    if (!visit) {
      throw new NotFoundException('Visita não encontrada.');
    }

    const ended = visit.end({ endedAt: input.endedAt, summary: input.summary });
    const saved = await this.visits.save(Object.assign(ended, { id: visit.id }));

    // Dispara a criação do registro de relatório e o enfileiramento do
    // job de PDF — `visits` não conhece `reports`, apenas publica o
    // evento (ver módulo `reports`). Usa `emitAsync` (não `emit`) para
    // aguardar o listener: a RENDERIZAÇÃO do PDF continua assíncrona (via
    // fila, processada por apps/workers), mas a criação do registro
    // `Report` (status PENDENTE) precisa existir antes desta chamada
    // retornar, ou o cliente que consultar o status imediatamente depois
    // do encerramento veria um 404 por uma corrida de timing.
    const { tenantId } = tenantContext.getOrThrow();
    await this.events.emitAsync('visit.ended', new VisitEndedEvent(saved.id, tenantId));

    return saved;
  }
}
