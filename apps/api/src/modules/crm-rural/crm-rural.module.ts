import { Module } from '@nestjs/common';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { ClientsController } from './interface/clients.controller';
import { PropertiesController } from './interface/properties.controller';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case';
import { GetClientUseCase } from './application/use-cases/get-client.use-case';
import { UpdateClientUseCase } from './application/use-cases/update-client.use-case';
import { DeactivateClientUseCase } from './application/use-cases/deactivate-client.use-case';
import { CreatePropertyUseCase } from './application/use-cases/create-property.use-case';
import { GetPropertyUseCase } from './application/use-cases/get-property.use-case';
import { UpdatePropertyUseCase } from './application/use-cases/update-property.use-case';
import { DeactivatePropertyUseCase } from './application/use-cases/deactivate-property.use-case';
import { PrismaClientRepository } from './infrastructure/prisma-client.repository';
import { PrismaPropertyRepository } from './infrastructure/prisma-property.repository';
import { CLIENT_REPOSITORY } from './domain/repositories/client.repository';
import { PROPERTY_REPOSITORY } from './domain/repositories/property.repository';

@Module({
  imports: [CustomFieldsModule],
  controllers: [ClientsController, PropertiesController],
  providers: [
    CreateClientUseCase,
    ListClientsUseCase,
    GetClientUseCase,
    UpdateClientUseCase,
    DeactivateClientUseCase,
    CreatePropertyUseCase,
    GetPropertyUseCase,
    UpdatePropertyUseCase,
    DeactivatePropertyUseCase,
    { provide: CLIENT_REPOSITORY, useClass: PrismaClientRepository },
    { provide: PROPERTY_REPOSITORY, useClass: PrismaPropertyRepository },
  ],
  exports: [CLIENT_REPOSITORY, PROPERTY_REPOSITORY, CreateClientUseCase, CreatePropertyUseCase],
})
export class CrmRuralModule {}
