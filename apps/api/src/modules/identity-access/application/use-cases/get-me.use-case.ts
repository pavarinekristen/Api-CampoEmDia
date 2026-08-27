import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { tenantContext } from '../../../../common/context/tenant-context';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetMeUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute() {
    const { userId } = tenantContext.getOrThrow();
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user.toPublic();
  }
}
