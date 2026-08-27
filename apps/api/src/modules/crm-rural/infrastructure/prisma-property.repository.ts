import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { paginationToSkipTake } from '../../../common/dto/paginated-result';
import { Property } from '../domain/entities/property.entity';
import { PropertyRepository, UpdatePropertyPatch } from '../domain/repositories/property.repository';

@Injectable()
export class PrismaPropertyRepository implements PropertyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(property: Property): Promise<Property & { id: string }> {
    // tenantId explícito para satisfazer o tipo do Prisma — o middleware de
    // tenant confirma/sobrescreve com o mesmo valor em runtime.
    const created = await this.prisma.property.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        clientId: property.clientId,
        name: property.name,
        location: property.location ?? undefined,
        latitude: property.latitude ?? undefined,
        longitude: property.longitude ?? undefined,
        activities: property.activities ?? undefined,
        frequency: property.frequency ?? undefined,
      },
    });
    return Property.fromPersistence(created);
  }

  async findById(id: string): Promise<(Property & { id: string }) | null> {
    const row = await this.prisma.property.findFirst({ where: { id, deletedAt: null } });
    return row ? Property.fromPersistence(row) : null;
  }

  async findByClientIdPaginated(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Array<Property & { id: string }>; total: number }> {
    const { skip, take } = paginationToSkipTake(page, limit);
    const where = { clientId, deletedAt: null };
    const [rows, total] = await Promise.all([
      this.prisma.property.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.property.count({ where }),
    ]);
    return { items: rows.map((row) => Property.fromPersistence(row)), total };
  }

  async update(
    id: string,
    patch: UpdatePropertyPatch,
    expectedVersion?: number,
  ): Promise<(Property & { id: string }) | 'CONFLICT'> {
    const result = await this.prisma.property.updateMany({
      where: { id, deletedAt: null, ...(expectedVersion !== undefined ? { version: expectedVersion } : {}) },
      data: { ...patch, version: { increment: 1 } },
    });

    if (result.count === 0) {
      return 'CONFLICT';
    }

    const updated = await this.prisma.property.findFirstOrThrow({ where: { id } });
    return Property.fromPersistence(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.property.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
