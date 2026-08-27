import { Module } from '@nestjs/common';
import { ReportsController } from './interface/reports.controller';
import { VisitEndedListener } from './application/visit-ended.listener';

@Module({
  controllers: [ReportsController],
  providers: [VisitEndedListener],
})
export class ReportsModule {}
