import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';
import { CustomFieldsValidatorService } from '../../../custom-fields/application/custom-fields-validator.service';

export interface CreateClientInput {
  name: string;
  contact?: string;
  notes?: string;
  customFields?: Record<string, unknown>;
}

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository,
    private readonly customFieldsValidator: CustomFieldsValidatorService,
  ) {}

  async execute(input: CreateClientInput) {
    const customFields = await this.customFieldsValidator.validate('CLIENT', input.customFields);
    const client = Client.create({ ...input, customFields });
    return this.clients.create(client);
  }
}
