import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { Visit } from '../domain/entities/visit.entity';
import { VisitRepository } from '../domain/repositories/visit.repository';

@Injectable()
export class PrismaVisitRepository implements VisitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(visit: Visit): Promise<Visit & { id: string }> {
    // tenantId explícito para satisfazer o tipo do Prisma — o middleware de
    // tenant confirma/sobrescreve com o mesmo valor em runtime.
    const created = await this.prisma.visit.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        clientGeneratedId: visit.clientGeneratedId,
        propertyId: visit.propertyId,
        professionalId: visit.professionalId,
        type: visit.type,
        status: visit.status,
        startedAt: visit.startedAt,
      },
    });
    return Visit.fromPersistence(created);
  }

  async findById(id: string): Promise<(Visit & { id: string }) | null> {
    const row = await this.prisma.visit.findUnique({ where: { id } });
    return row ? Visit.fromPersistence(row) : null;
  }

  async findByClientGeneratedId(clientGeneratedId: string): Promise<(Visit & { id: string }) | null> {
    // findFirst (não findUnique) porque o middleware de tenant adiciona
    // `tenantId` ao `where`, e queremos permitir a combinação livre de
    // filtros aqui — clientGeneratedId já é globalmente único por design
    // (UUID gerado no dispositivo), então o resultado é equivalente.
    const row = await this.prisma.visit.findFirst({ where: { clientGeneratedId } });
    return row ? Visit.fromPersistence(row) : null;
  }

  async save(visit: Visit & { id: string }): Promise<Visit & { id: string }> {
    const updated = await this.prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: visit.status,
        endedAt: visit.endedAt,
        summary: visit.summary,
      },
    });
    return Visit.fromPersistence(updated);
  }
}
