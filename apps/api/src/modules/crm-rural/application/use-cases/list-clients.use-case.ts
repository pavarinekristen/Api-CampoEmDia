import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';

@Injectable()
export class ListClientsUseCase {
  constructor(@Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository) {}

  async execute() {
    return this.clients.findAll();
  }
}
