import { Module } from '@nestjs/common';
import { ClientsController } from './interface/clients.controller';
import { PropertiesController } from './interface/properties.controller';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case';
import { CreatePropertyUseCase } from './application/use-cases/create-property.use-case';
import { PrismaClientRepository } from './infrastructure/prisma-client.repository';
import { PrismaPropertyRepository } from './infrastructure/prisma-property.repository';
import { CLIENT_REPOSITORY } from './domain/repositories/client.repository';
import { PROPERTY_REPOSITORY } from './domain/repositories/property.repository';

@Module({
  controllers: [ClientsController, PropertiesController],
  providers: [
    CreateClientUseCase,
    ListClientsUseCase,
    CreatePropertyUseCase,
    { provide: CLIENT_REPOSITORY, useClass: PrismaClientRepository },
    { provide: PROPERTY_REPOSITORY, useClass: PrismaPropertyRepository },
  ],
  exports: [CLIENT_REPOSITORY, PROPERTY_REPOSITORY, CreateClientUseCase, CreatePropertyUseCase],
})
export class CrmRuralModule {}
