import { Module } from '@nestjs/common';
import { CrmRuralModule } from '../crm-rural/crm-rural.module';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { AnimalsController } from './interface/animals.controller';
import { LotesController } from './interface/lotes.controller';
import { HealthEventsController } from './interface/health-events.controller';
import { CreateAnimalUseCase } from './application/use-cases/create-animal.use-case';
import { GetAnimalUseCase } from './application/use-cases/get-animal.use-case';
import { ListAnimalsUseCase } from './application/use-cases/list-animals.use-case';
import { UpdateAnimalUseCase } from './application/use-cases/update-animal.use-case';
import { ChangeAnimalStatusUseCase } from './application/use-cases/change-animal-status.use-case';
import { ExportAnimalsCsvUseCase } from './application/use-cases/export-animals-csv.use-case';
import { CreateLoteUseCase } from './application/use-cases/create-lote.use-case';
import { ListLotesUseCase } from './application/use-cases/list-lotes.use-case';
import { UpdateLoteUseCase } from './application/use-cases/update-lote.use-case';
import { CreateHealthEventUseCase } from './application/use-cases/create-health-event.use-case';
import { ListHealthEventsUseCase } from './application/use-cases/list-health-events.use-case';
import { ListUpcomingHealthEventsUseCase } from './application/use-cases/list-upcoming-health-events.use-case';
import { PrismaAnimalRepository } from './infrastructure/prisma-animal.repository';
import { PrismaLoteRepository } from './infrastructure/prisma-lote.repository';
import { PrismaAnimalHealthEventRepository } from './infrastructure/prisma-animal-health-event.repository';
import { ANIMAL_REPOSITORY } from './domain/repositories/animal.repository';
import { LOTE_REPOSITORY } from './domain/repositories/lote.repository';
import { ANIMAL_HEALTH_EVENT_REPOSITORY } from './domain/repositories/animal-health-event.repository';

@Module({
  // CrmRuralModule: reaproveita PROPERTY_REPOSITORY pra validar que a
  // propriedade existe (mesmo padrão de CreatePropertyUseCase validando
  // CLIENT_REPOSITORY). CustomFieldsModule: validação de customFields do
  // Animal + listagem de definições pra montar o CSV.
  imports: [CrmRuralModule, CustomFieldsModule],
  controllers: [AnimalsController, LotesController, HealthEventsController],
  providers: [
    CreateAnimalUseCase,
    GetAnimalUseCase,
    ListAnimalsUseCase,
    UpdateAnimalUseCase,
    ChangeAnimalStatusUseCase,
    ExportAnimalsCsvUseCase,
    CreateLoteUseCase,
    ListLotesUseCase,
    UpdateLoteUseCase,
    CreateHealthEventUseCase,
    ListHealthEventsUseCase,
    ListUpcomingHealthEventsUseCase,
    { provide: ANIMAL_REPOSITORY, useClass: PrismaAnimalRepository },
    { provide: LOTE_REPOSITORY, useClass: PrismaLoteRepository },
    { provide: ANIMAL_HEALTH_EVENT_REPOSITORY, useClass: PrismaAnimalHealthEventRepository },
  ],
})
export class VeterinaryModule {}
