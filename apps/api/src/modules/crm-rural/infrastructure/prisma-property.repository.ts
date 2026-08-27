import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { Property } from '../domain/entities/property.entity';
import { PropertyRepository } from '../domain/repositories/property.repository';

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
    return Object.assign(property, { id: created.id });
  }

  async findById(id: string): Promise<(Property & { id: string }) | null> {
    const row = await this.prisma.property.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByClientId(clientId: string): Promise<Array<Property & { id: string }>> {
    const rows = await this.prisma.property.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: {
    id: string;
    clientId: string;
    name: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    activities: string | null;
    frequency: string | null;
  }): Property & { id: string } {
    return Object.assign(
      Property.create({
        clientId: row.clientId,
        name: row.name,
        location: row.location ?? undefined,
        latitude: row.latitude ?? undefined,
        longitude: row.longitude ?? undefined,
        activities: row.activities ?? undefined,
        frequency: row.frequency ?? undefined,
      }),
      { id: row.id },
    );
  }
}
