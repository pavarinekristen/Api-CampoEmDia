import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { tenantContext } from '../../../../common/context/tenant-context';
import { User, UserRole } from '../../domain/entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../../infrastructure/password-hasher.service';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface InviteUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Adiciona um novo membro à equipe do tenant autenticado (gestor/dono
 * convidando um técnico, por exemplo). Diferente de RegisterTenantUseCase
 * (que cria tenant + primeiro usuário sem sessão), aqui já existe um
 * TenantContext ambiente vindo do TenantInterceptor.
 */
@Injectable()
export class InviteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: InviteUserInput) {
    const existing = await this.userRepository.findByEmailAcrossTenants(input.email);
    if (existing) {
      throw new ConflictException('Já existe uma conta com este e-mail.');
    }

    const { tenantId } = tenantContext.getOrThrow();
    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = User.create({ tenantId, name: input.name, email: input.email, passwordHash, role: input.role });
    const created = await this.userRepository.create(user);

    await this.auditLog.record({ entity: 'User', entityId: created.id, action: 'INVITE_USER' });
    return created.toPublic();
  }
}
