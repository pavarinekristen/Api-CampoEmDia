import { Inject, Injectable } from '@nestjs/common';
import { buildPaginatedResult } from '../../../../common/dto/paginated-result';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';

@Injectable()
export class ListClientsUseCase {
  constructor(@Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.clients.findAllPaginated(page, limit);
    return buildPaginatedResult(items, total, page, limit);
  }
}
