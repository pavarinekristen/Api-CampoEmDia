import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';

export interface CreateClientInput {
  name: string;
  contact?: string;
  notes?: string;
}

@Injectable()
export class CreateClientUseCase {
  constructor(@Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository) {}

  async execute(input: CreateClientInput) {
    const client = Client.create(input);
    return this.clients.create(client);
  }
}
