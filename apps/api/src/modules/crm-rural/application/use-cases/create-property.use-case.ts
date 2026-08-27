import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Property } from '../../domain/entities/property.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../../domain/repositories/property.repository';
import { CustomFieldsValidatorService } from '../../../custom-fields/application/custom-fields-validator.service';

export interface CreatePropertyInput {
  clientId: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  activities?: string;
  frequency?: string;
  customFields?: Record<string, unknown>;
}

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository,
    private readonly customFieldsValidator: CustomFieldsValidatorService,
  ) {}

  async execute(input: CreatePropertyInput) {
    const client = await this.clients.findById(input.clientId);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    const customFields = await this.customFieldsValidator.validate('PROPERTY', input.customFields);
    const property = Property.create({ ...input, customFields });
    return this.properties.create(property);
  }
}
