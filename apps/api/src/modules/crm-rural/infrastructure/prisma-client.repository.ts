import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { Client } from '../domain/entities/client.entity';
import { ClientRepository } from '../domain/repositories/client.repository';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(client: Client): Promise<Client & { id: string }> {
    // tenantId explícito para satisfazer o tipo do Prisma — o middleware de
    // tenant confirma/sobrescreve com o mesmo valor em runtime.
    const created = await this.prisma.client.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        name: client.name,
        contact: client.contact ?? undefined,
        notes: client.notes ?? undefined,
      },
    });
    return Object.assign(client, { id: created.id });
  }

  async findById(id: string): Promise<(Client & { id: string }) | null> {
    const row = await this.prisma.client.findUnique({ where: { id } });
    if (!row) return null;
    return Object.assign(
      Client.create({ name: row.name, contact: row.contact ?? undefined, notes: row.notes ?? undefined }),
      { id: row.id },
    );
  }

  async findAll(): Promise<Array<Client & { id: string }>> {
    tenantContext.getOrThrow(); // garante fail-fast se chamado fora de contexto
    const rows = await this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) =>
      Object.assign(
        Client.create({ name: row.name, contact: row.contact ?? undefined, notes: row.notes ?? undefined }),
        { id: row.id },
      ),
    );
  }
}
