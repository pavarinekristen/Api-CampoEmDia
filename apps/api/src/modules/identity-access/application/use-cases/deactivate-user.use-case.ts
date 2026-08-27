import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(userId: string) {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const deactivated = await this.userRepository.update(Object.assign(existing.deactivate(), { id: existing.id }));

    await this.auditLog.record({ entity: 'User', entityId: deactivated.id, action: 'DEACTIVATE' });
    return deactivated.toPublic();
  }
}
