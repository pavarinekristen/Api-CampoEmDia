import { Module } from '@nestjs/common';
import { VisitsModule } from '../visits/visits.module';
import { SyncController } from './interface/sync.controller';
import { SyncPushUseCase } from './application/sync-push.use-case';
import { SyncPullUseCase } from './application/sync-pull.use-case';

@Module({
  imports: [VisitsModule],
  controllers: [SyncController],
  providers: [SyncPushUseCase, SyncPullUseCase],
})
export class SyncModule {}
