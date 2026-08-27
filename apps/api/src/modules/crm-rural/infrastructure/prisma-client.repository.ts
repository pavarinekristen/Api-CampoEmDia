import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { paginationToSkipTake } from '../../../common/dto/paginated-result';
import { toNullableJsonInput } from '../../../common/prisma/json-field';
import { Client } from '../domain/entities/client.entity';
import { ClientRepository, UpdateClientPatch } from '../domain/repositories/client.repository';

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
        customFields: toNullableJsonInput(client.customFields),
      },
    });
    return Client.fromPersistence(created);
  }

  async findById(id: string): Promise<(Client & { id: string }) | null> {
    const row = await this.prisma.client.findFirst({ where: { id, deletedAt: null } });
    return row ? Client.fromPersistence(row) : null;
  }

  async findAllPaginated(page: number, limit: number): Promise<{ items: Array<Client & { id: string }>; total: number }> {
    const { skip, take } = paginationToSkipTake(page, limit);
    const where = { deletedAt: null };
    const [rows, total] = await Promise.all([
      this.prisma.client.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.client.count({ where }),
    ]);
    return { items: rows.map((row) => Client.fromPersistence(row)), total };
  }

  async update(
    id: string,
    patch: UpdateClientPatch,
    expectedVersion?: number,
  ): Promise<(Client & { id: string }) | 'CONFLICT'> {
    const { customFields, ...rest } = patch;
    const result = await this.prisma.client.updateMany({
      where: { id, deletedAt: null, ...(expectedVersion !== undefined ? { version: expectedVersion } : {}) },
      data: { ...rest, customFields: toNullableJsonInput(customFields), version: { increment: 1 } },
    });

    if (result.count === 0) {
      return 'CONFLICT';
    }

    const updated = await this.prisma.client.findFirstOrThrow({ where: { id } });
    return Client.fromPersistence(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
