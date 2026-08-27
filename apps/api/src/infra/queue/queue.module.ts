import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

/**
 * Registra a conexão Redis compartilhada por todas as filas do sistema.
 * Cada módulo de negócio registra suas próprias filas nomeadas
 * (ex: `reports` registra a fila `pdf-generation`), mas todas reusam esta
 * conexão central.
 *
 * Filas conhecidas (consumidas por apps/workers):
 *  - pdf-generation        → reports
 *  - audio-transcription   → media
 */
export const QUEUE_NAMES = {
  PDF_GENERATION: 'pdf-generation',
  AUDIO_TRANSCRIPTION: 'audio-transcription',
} as const;

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.PDF_GENERATION },
      { name: QUEUE_NAMES.AUDIO_TRANSCRIPTION },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
