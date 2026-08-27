import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../../../infra/queue/queue.module';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { VisitEndedEvent } from '../../visits/domain/events/visit-ended.event';

/**
 * Reage ao encerramento de uma visita criando o registro `Report`
 * (status PENDENTE) e enfileirando o job assíncrono de geração de PDF —
 * consumido por `apps/workers` (ver pdf-report.processor.ts). Nunca gera o
 * PDF de forma síncrona no request/response.
 */
@Injectable()
export class VisitEndedListener {
  private readonly logger = new Logger(VisitEndedListener.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.PDF_GENERATION) private readonly pdfQueue: Queue,
  ) {}

  @OnEvent('visit.ended')
  async handle(event: VisitEndedEvent): Promise<void> {
    await tenantContext.run({ tenantId: event.tenantId, userId: 'system', role: 'SYSTEM' }, async () => {
      // tenantId explícito no `create` para satisfazer o tipo do Prisma —
      // o middleware de tenant confirma/sobrescreve com o mesmo valor.
      const report = await this.prisma.report.upsert({
        where: { visitId: event.visitId },
        create: { tenantId: event.tenantId, visitId: event.visitId, status: 'PENDENTE' },
        update: {},
      });

      await this.pdfQueue.add(
        'generate',
        { reportId: report.id, visitId: event.visitId, tenantId: event.tenantId },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );

      this.logger.log(`Relatório enfileirado para geração — visitId=${event.visitId}`);
    });
  }
}
