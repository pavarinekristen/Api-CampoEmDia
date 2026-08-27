import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../domain/entities/user.entity';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface UpdateUserInput {
  userId: string;
  name?: string;
  role?: UserRole;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdateUserInput) {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const updated = await this.userRepository.update(
      Object.assign(existing.update({ name: input.name, role: input.role }), { id: existing.id }),
    );

    await this.auditLog.record({
      entity: 'User',
      entityId: updated.id,
      action: 'UPDATE',
      diff: { name: input.name, role: input.role },
    });
    return updated.toPublic();
  }
}
