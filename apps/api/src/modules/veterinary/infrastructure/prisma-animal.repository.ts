import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { paginationToSkipTake } from '../../../common/dto/paginated-result';
import { toNullableJsonInput } from '../../../common/prisma/json-field';
import { Animal } from '../domain/entities/animal.entity';
import { AnimalListFilters, AnimalRepository, UpdateAnimalPatch } from '../domain/repositories/animal.repository';

@Injectable()
export class PrismaAnimalRepository implements AnimalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(animal: Animal): Promise<Animal & { id: string }> {
    const created = await this.prisma.animal.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        propertyId: animal.propertyId,
        loteId: animal.loteId ?? undefined,
        identifier: animal.identifier,
        name: animal.name ?? undefined,
        species: animal.species,
        breed: animal.breed ?? undefined,
        sex: animal.sex ?? undefined,
        birthDate: animal.birthDate ?? undefined,
        customFields: toNullableJsonInput(animal.customFields),
      },
    });
    return Animal.fromPersistence(created);
  }

  async findById(id: string): Promise<(Animal & { id: string }) | null> {
    const row = await this.prisma.animal.findFirst({ where: { id, deletedAt: null } });
    return row ? Animal.fromPersistence(row) : null;
  }

  async findAllPaginated(
    filters: AnimalListFilters,
    page: number,
    limit: number,
  ): Promise<{ items: Array<Animal & { id: string }>; total: number }> {
    const { skip, take } = paginationToSkipTake(page, limit);
    const where = {
      propertyId: filters.propertyId,
      status: filters.status,
      loteId: filters.loteId,
      deletedAt: null,
    };
    const [rows, total] = await Promise.all([
      this.prisma.animal.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.animal.count({ where }),
    ]);
    return { items: rows.map((row) => Animal.fromPersistence(row)), total };
  }

  async findAllByProperty(propertyId: string): Promise<Array<Animal & { id: string }>> {
    const rows = await this.prisma.animal.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { identifier: 'asc' },
    });
    return rows.map((row) => Animal.fromPersistence(row));
  }

  async update(
    id: string,
    patch: UpdateAnimalPatch,
    expectedVersion?: number,
  ): Promise<(Animal & { id: string }) | 'CONFLICT'> {
    const { customFields, ...rest } = patch;
    const result = await this.prisma.animal.updateMany({
      where: { id, deletedAt: null, ...(expectedVersion !== undefined ? { version: expectedVersion } : {}) },
      data: { ...rest, customFields: toNullableJsonInput(customFields), version: { increment: 1 } },
    });

    if (result.count === 0) {
      return 'CONFLICT';
    }

    const updated = await this.prisma.animal.findFirstOrThrow({ where: { id } });
    return Animal.fromPersistence(updated);
  }

  async saveStatus(animal: Animal & { id: string }): Promise<Animal & { id: string }> {
    const updated = await this.prisma.animal.update({
      where: { id: animal.id },
      data: {
        status: animal.status,
        statusReason: animal.statusReason ?? undefined,
        statusAt: animal.statusAt ?? undefined,
        version: { increment: 1 },
      },
    });
    return Animal.fromPersistence(updated);
  }
}
