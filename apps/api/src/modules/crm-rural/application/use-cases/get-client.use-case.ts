import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';

@Injectable()
export class GetClientUseCase {
  constructor(@Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository) {}

  async execute(id: string) {
    const client = await this.clients.findById(id);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    return client;
  }
}
