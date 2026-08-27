import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { Worker } from 'bullmq';

// `npm run --workspace=apps/workers` executa com cwd na própria pasta do
// workspace, não na raiz do monorepo — por isso o caminho do .env é
// resolvido explicitamente em vez de depender do cwd padrão do dotenv.
loadEnv({ path: resolve(__dirname, '../../../.env') });
import { processPdfGenerationJob } from './processors/pdf-report.processor';
import { processAudioTranscriptionJob } from './processors/audio-transcription.processor';

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

const pdfWorker = new Worker('pdf-generation', processPdfGenerationJob, { connection, concurrency: 2 });
const transcriptionWorker = new Worker('audio-transcription', processAudioTranscriptionJob, {
  connection,
  concurrency: 4,
});

for (const worker of [pdfWorker, transcriptionWorker]) {
  worker.on('completed', (job) => {
    // eslint-disable-next-line no-console
    console.log(`[${worker.name}] job ${job.id} concluído`);
  });
  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`[${worker.name}] job ${job?.id} falhou:`, err.message);
  });
}

// eslint-disable-next-line no-console
console.log('[campo-em-dia-workers] pdf-generation e audio-transcription workers no ar');

process.on('SIGTERM', async () => {
  await Promise.all([pdfWorker.close(), transcriptionWorker.close()]);
  process.exit(0);
});
