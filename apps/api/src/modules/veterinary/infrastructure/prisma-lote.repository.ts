import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { Lote } from '../domain/entities/lote.entity';
import { LoteRepository } from '../domain/repositories/lote.repository';

@Injectable()
export class PrismaLoteRepository implements LoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(lote: Lote): Promise<Lote & { id: string }> {
    const created = await this.prisma.lote.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        propertyId: lote.propertyId,
        name: lote.name,
        description: lote.description ?? undefined,
      },
    });
    return Lote.fromPersistence(created);
  }

  async findById(id: string): Promise<(Lote & { id: string }) | null> {
    const row = await this.prisma.lote.findUnique({ where: { id } });
    return row ? Lote.fromPersistence(row) : null;
  }

  async findAllByProperty(propertyId: string): Promise<Array<Lote & { id: string }>> {
    const rows = await this.prisma.lote.findMany({ where: { propertyId }, orderBy: { name: 'asc' } });
    return rows.map((row) => Lote.fromPersistence(row));
  }

  async update(lote: Lote & { id: string }): Promise<Lote & { id: string }> {
    const updated = await this.prisma.lote.update({
      where: { id: lote.id },
      data: { name: lote.name, description: lote.description ?? undefined },
    });
    return Lote.fromPersistence(updated);
  }
}
