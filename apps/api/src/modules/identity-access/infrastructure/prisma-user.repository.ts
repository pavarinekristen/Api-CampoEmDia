import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { paginationToSkipTake } from '../../../common/dto/paginated-result';
import { User, UserRole } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmailAcrossTenants(email: string): Promise<(User & { id: string }) | null> {
    // Uso deliberado de $queryRaw: contorna o middleware de tenant do
    // PrismaService (que exige TenantContext para o model `User`), porque
    // no momento do login o tenant ainda não é conhecido — é justamente o
    // que estamos descobrindo. Este é o único ponto do sistema autorizado
    // a fazer essa busca sem escopo de tenant.
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        tenantId: string;
        name: string;
        email: string;
        passwordHash: string;
        role: UserRole;
        active: boolean;
      }>
    >`SELECT id, "tenantId", name, email, "passwordHash", role, active
      FROM users WHERE email = ${email.toLowerCase().trim()} AND active = true LIMIT 1`;

    const row = rows[0];
    return row ? User.fromPersistence(row) : null;
  }

  async create(user: User): Promise<User & { id: string }> {
    // A criação roda dentro de um TenantContext já estabelecido pelo
    // use-case (RegisterTenantUseCase seta o contexto para o tenant recém
    // criado antes de chamar este método), então o middleware de tenant
    // do PrismaService aplica o `tenantId` normalmente.
    //
    // IMPORTANTE: o callback precisa dar `await` na Prisma promise POR
    // DENTRO de si mesmo (não apenas retorná-la). Prisma retorna uma
    // "PrismaPromise" preguiçosa — o middleware $use só dispara quando ela
    // é de fato aguardada. Se o callback apenas retornar a promise sem
    // aguardá-la, esse `.then()` acontece fora do `run()`, depois que o
    // AsyncLocalStorage já perdeu o contexto, e o middleware falha com
    // "sem TenantContext ativo" mesmo estando aparentemente "dentro" do
    // run() no código-fonte.
    const created = await tenantContext.run(
      { tenantId: user.tenantId, userId: 'system', role: 'SYSTEM' },
      async () =>
        await this.prisma.user.create({
          data: {
            tenantId: user.tenantId,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
          },
        }),
    );
    return User.fromPersistence(created);
  }

  async findById(id: string): Promise<(User & { id: string }) | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? User.fromPersistence(row) : null;
  }

  async findAllByTenant(page: number, limit: number): Promise<{ items: Array<User & { id: string }>; total: number }> {
    const { skip, take } = paginationToSkipTake(page, limit);
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'asc' } }),
      this.prisma.user.count(),
    ]);
    return { items: rows.map((row) => User.fromPersistence(row)), total };
  }

  async update(user: User & { id: string }): Promise<User & { id: string }> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { name: user.name, role: user.role, active: user.active },
    });
    return User.fromPersistence(updated);
  }
}
