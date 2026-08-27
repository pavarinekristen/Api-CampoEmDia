import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Property } from '../../domain/entities/property.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../../domain/repositories/property.repository';

export interface CreatePropertyInput {
  clientId: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  activities?: string;
  frequency?: string;
}

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository,
  ) {}

  async execute(input: CreatePropertyInput) {
    const client = await this.clients.findById(input.clientId);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    const property = Property.create(input);
    return this.properties.create(property);
  }
}
