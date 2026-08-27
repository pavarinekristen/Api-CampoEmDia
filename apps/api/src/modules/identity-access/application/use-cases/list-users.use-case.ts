import { Inject, Injectable } from '@nestjs/common';
import { buildPaginatedResult } from '../../../../common/dto/paginated-result';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.userRepository.findAllByTenant(page, limit);
    return buildPaginatedResult(
      items.map((user) => user.toPublic()),
      total,
      page,
      limit,
    );
  }
}
