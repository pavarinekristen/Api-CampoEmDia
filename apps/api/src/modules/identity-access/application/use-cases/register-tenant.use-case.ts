import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { Tenant, TenantType } from '../../domain/entities/tenant.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';

export interface RegisterTenantInput {
  tenantType: TenantType;
  tenantName: string;
  document?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface RegisterTenantOutput {
  tenantId: string;
  userId: string;
}

const OWNER_ROLE: UserRole = 'PROFISSIONAL_PROPRIETARIO';
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Fluxo de bootstrap: cria o Tenant (autônomo ou empresa) e o primeiro
 * usuário, com papel de proprietário. É o único fluxo do sistema em que um
 * usuário é criado sem já existir um tenant — por isso não passa pelo
 * `TenantInterceptor` (a rota fica fora do JwtAuthGuard).
 */
@Injectable()
export class RegisterTenantUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RegisterTenantInput): Promise<RegisterTenantOutput> {
    const existing = await this.userRepository.findByEmailAcrossTenants(input.ownerEmail);
    if (existing) {
      throw new ConflictException('Já existe uma conta com este e-mail.');
    }

    const tenant =
      input.tenantType === 'AUTONOMO'
        ? Tenant.createForAutonomo(input.tenantName, input.document)
        : Tenant.createForEmpresa(input.tenantName, input.document);

    const createdTenant = await this.prisma.tenant.create({
      data: { type: tenant.type, name: tenant.name, document: tenant.document ?? undefined },
    });

    const passwordHash = await bcrypt.hash(input.ownerPassword, BCRYPT_SALT_ROUNDS);
    const owner = User.create({
      tenantId: createdTenant.id,
      name: input.ownerName,
      email: input.ownerEmail,
      passwordHash,
      role: OWNER_ROLE,
    });
    const createdUser = await this.userRepository.create(owner);

    return { tenantId: createdTenant.id, userId: createdUser.id };
  }
}
