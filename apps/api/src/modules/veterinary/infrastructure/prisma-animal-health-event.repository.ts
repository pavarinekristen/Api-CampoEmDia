import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { paginationToSkipTake } from '../../../common/dto/paginated-result';
import { toNullableJsonInput } from '../../../common/prisma/json-field';
import { AnimalHealthEvent } from '../domain/entities/animal-health-event.entity';
import { AnimalHealthEventRepository } from '../domain/repositories/animal-health-event.repository';

@Injectable()
export class PrismaAnimalHealthEventRepository implements AnimalHealthEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(event: AnimalHealthEvent): Promise<AnimalHealthEvent & { id: string }> {
    const created = await this.prisma.animalHealthEvent.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        animalId: event.animalId,
        visitId: event.visitId ?? undefined,
        type: event.type,
        description: event.description,
        productName: event.productName ?? undefined,
        doseInfo: event.doseInfo ?? undefined,
        appliedById: event.appliedById ?? undefined,
        appliedAt: event.appliedAt,
        withdrawalUntil: event.withdrawalUntil ?? undefined,
        nextDueDate: event.nextDueDate ?? undefined,
        pregnancyStatus: event.pregnancyStatus ?? undefined,
        expectedBirthDate: event.expectedBirthDate ?? undefined,
        notes: event.notes ?? undefined,
        customFields: toNullableJsonInput(event.customFields),
      },
    });
    return AnimalHealthEvent.fromPersistence(created);
  }

  async findByAnimalIdPaginated(
    animalId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Array<AnimalHealthEvent & { id: string }>; total: number }> {
    const { skip, take } = paginationToSkipTake(page, limit);
    const where = { animalId };
    const [rows, total] = await Promise.all([
      this.prisma.animalHealthEvent.findMany({ where, skip, take, orderBy: { appliedAt: 'desc' } }),
      this.prisma.animalHealthEvent.count({ where }),
    ]);
    return { items: rows.map((row) => AnimalHealthEvent.fromPersistence(row)), total };
  }

  async findUpcoming(withinDays: number): Promise<Array<AnimalHealthEvent & { id: string }>> {
    const now = new Date();
    const until = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
    const rows = await this.prisma.animalHealthEvent.findMany({
      where: {
        OR: [
          { nextDueDate: { gte: now, lte: until } },
          { withdrawalUntil: { gte: now, lte: until } },
        ],
      },
      orderBy: { nextDueDate: 'asc' },
    });
    return rows.map((row) => AnimalHealthEvent.fromPersistence(row));
  }
}
