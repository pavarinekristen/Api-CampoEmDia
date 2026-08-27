import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Animal, AnimalSex } from '../../domain/entities/animal.entity';
import { ANIMAL_REPOSITORY, AnimalRepository } from '../../domain/repositories/animal.repository';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../../../crm-rural/domain/repositories/property.repository';
import { CustomFieldsValidatorService } from '../../../custom-fields/application/custom-fields-validator.service';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface CreateAnimalInput {
  propertyId: string;
  loteId?: string;
  identifier: string;
  name?: string;
  species: string;
  breed?: string;
  sex?: AnimalSex;
  birthDate?: Date;
  customFields?: Record<string, unknown>;
}

@Injectable()
export class CreateAnimalUseCase {
  constructor(
    @Inject(ANIMAL_REPOSITORY) private readonly animals: AnimalRepository,
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
    private readonly customFieldsValidator: CustomFieldsValidatorService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: CreateAnimalInput) {
    const property = await this.properties.findById(input.propertyId);
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada.');
    }

    const customFields = await this.customFieldsValidator.validate('ANIMAL', input.customFields);
    const animal = Animal.create({ ...input, customFields });

    let created: Animal & { id: string };
    try {
      created = await this.animals.create(animal);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Já existe um animal com identificação "${input.identifier}" nesta propriedade.`);
      }
      throw error;
    }

    await this.auditLog.record({ entity: 'Animal', entityId: created.id, action: 'CREATE' });
    return created;
  }
}
