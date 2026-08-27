import { Job } from 'bullmq';
import puppeteer from 'puppeteer';
import { prisma } from '../prisma';
import { uploadReportPdf } from '../storage';

export interface PdfGenerationJobData {
  reportId: string;
  visitId: string;
  tenantId: string;
}

/**
 * Renderiza o relatório da visita (histórico, evidências, orientações e
 * tarefas) para PDF via HTML→PDF headless e sobe o resultado ao object
 * storage. Roda fora do request/response da API (ver
 * VisitEndedListener, módulo `reports` da API) — geração de PDF com fotos
 * embutidas é lenta demais para bloquear a UI do técnico no campo.
 */
export async function processPdfGenerationJob(job: Job<PdfGenerationJobData>): Promise<void> {
  const { reportId, visitId, tenantId } = job.data;

  try {
    await prisma.report.update({ where: { id: reportId }, data: { status: 'PROCESSANDO' } });

    const visit = await prisma.visit.findFirst({
      where: { id: visitId, tenantId },
      include: {
        property: { include: { client: true } },
        evidences: true,
        tasks: true,
      },
    });

    if (!visit) {
      throw new Error(`Visita ${visitId} não encontrada para o tenant ${tenantId}.`);
    }

    const html = renderVisitReportHtml(visit);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

      const storageKey = await uploadReportPdf(tenantId, visitId, Buffer.from(pdfBuffer));

      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'PRONTO', storageKey, generatedAt: new Date() },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    await prisma.report.update({ where: { id: reportId }, data: { status: 'FALHOU' } });
    throw error; // deixa o BullMQ aplicar a política de retry (attempts/backoff)
  }
}

function renderVisitReportHtml(visit: {
  type: string;
  startedAt: Date;
  endedAt: Date | null;
  summary: string | null;
  property: { name: string; client: { name: string } };
  evidences: Array<{ type: string; note: string | null; transcriptDraft: string | null }>;
  tasks: Array<{ description: string; priority: string; dueDate: Date | null }>;
}): string {
  const evidencesHtml = visit.evidences
    .map((e) => `<li><strong>${e.type}</strong> — ${e.note ?? e.transcriptDraft ?? ''}</li>`)
    .join('');
  const tasksHtml = visit.tasks
    .map(
      (t) =>
        `<li>[${t.priority}] ${t.description}${t.dueDate ? ` — prazo: ${t.dueDate.toLocaleDateString('pt-BR')}` : ''}</li>`,
    )
    .join('');

  return `
    <html>
      <head><meta charset="utf-8" /><style>
        body { font-family: sans-serif; padding: 32px; color: #222; }
        h1 { font-size: 20px; } h2 { font-size: 16px; margin-top: 24px; }
        ul { padding-left: 20px; }
      </style></head>
      <body>
        <h1>Campo em Dia — Relatório de Visita</h1>
        <p><strong>Cliente:</strong> ${visit.property.client.name}</p>
        <p><strong>Propriedade:</strong> ${visit.property.name}</p>
        <p><strong>Tipo de visita:</strong> ${visit.type}</p>
        <p><strong>Início:</strong> ${visit.startedAt.toLocaleString('pt-BR')}</p>
        <p><strong>Encerramento:</strong> ${visit.endedAt?.toLocaleString('pt-BR') ?? '-'}</p>
        ${visit.summary ? `<p><strong>Resumo:</strong> ${visit.summary}</p>` : ''}
        <h2>Evidências</h2>
        <ul>${evidencesHtml || '<li>Nenhuma evidência registrada.</li>'}</ul>
        <h2>Orientações e tarefas</h2>
        <ul>${tasksHtml || '<li>Nenhuma tarefa registrada.</li>'}</ul>
      </body>
    </html>
  `;
}
