import { Module } from '@nestjs/common';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { VisitsController } from './interface/visits.controller';
import { StartVisitUseCase } from './application/use-cases/start-visit.use-case';
import { AddEvidenceUseCase } from './application/use-cases/add-evidence.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { EndVisitUseCase } from './application/use-cases/end-visit.use-case';
import { CancelVisitUseCase } from './application/use-cases/cancel-visit.use-case';
import { ListVisitsUseCase } from './application/use-cases/list-visits.use-case';
import { GetVisitUseCase } from './application/use-cases/get-visit.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { ListEvidencesUseCase } from './application/use-cases/list-evidences.use-case';
import { PrismaVisitRepository } from './infrastructure/prisma-visit.repository';
import { PrismaEvidenceRepository } from './infrastructure/prisma-evidence.repository';
import { PrismaTaskRepository } from './infrastructure/prisma-task.repository';
import { VISIT_REPOSITORY } from './domain/repositories/visit.repository';
import { EVIDENCE_REPOSITORY } from './domain/repositories/evidence.repository';
import { TASK_REPOSITORY } from './domain/repositories/task.repository';

@Module({
  imports: [CustomFieldsModule],
  controllers: [VisitsController],
  providers: [
    StartVisitUseCase,
    AddEvidenceUseCase,
    CreateTaskUseCase,
    EndVisitUseCase,
    CancelVisitUseCase,
    ListVisitsUseCase,
    GetVisitUseCase,
    UpdateTaskUseCase,
    ListEvidencesUseCase,
    { provide: VISIT_REPOSITORY, useClass: PrismaVisitRepository },
    { provide: EVIDENCE_REPOSITORY, useClass: PrismaEvidenceRepository },
    { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository },
  ],
  exports: [
    VISIT_REPOSITORY,
    EVIDENCE_REPOSITORY,
    TASK_REPOSITORY,
    StartVisitUseCase,
    AddEvidenceUseCase,
    CreateTaskUseCase,
    EndVisitUseCase,
  ],
})
export class VisitsModule {}
