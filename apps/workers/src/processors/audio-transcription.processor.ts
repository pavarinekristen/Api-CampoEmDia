import { Job } from 'bullmq';
import { prisma } from '../prisma';

export interface AudioTranscriptionJobData {
  evidenceId: string;
  tenantId: string;
  storageKey: string;
}

/**
 * Transcreve o áudio de uma evidência e grava o resultado como
 * `transcriptDraft` — nunca marca `transcriptReviewed`. A confirmação
 * humana do conteúdo é obrigatória antes de a transcrição virar orientação
 * oficial (ver plano arquitetural, princípio de segurança/responsabilidade
 * e Evidence.attachTranscriptDraft no domínio de `visits`).
 *
 * A chamada ao provedor de transcrição (ex: um serviço de speech-to-text)
 * é um placeholder nesta versão — plugue o cliente real aqui quando o
 * provedor for escolhido.
 */
export async function processAudioTranscriptionJob(job: Job<AudioTranscriptionJobData>): Promise<void> {
  const { evidenceId, tenantId, storageKey } = job.data;

  const evidence = await prisma.evidence.findFirst({ where: { id: evidenceId, tenantId } });
  if (!evidence) {
    throw new Error(`Evidência ${evidenceId} não encontrada para o tenant ${tenantId}.`);
  }

  const draft = await transcribeAudioPlaceholder(storageKey);

  await prisma.evidence.update({
    where: { id: evidenceId },
    data: { transcriptDraft: draft, transcriptReviewed: false },
  });
}

async function transcribeAudioPlaceholder(storageKey: string): Promise<string> {
  // TODO: integrar provedor real de speech-to-text (ex: Whisper API).
  return `[rascunho pendente de transcrição real — arquivo: ${storageKey}]`;
}
