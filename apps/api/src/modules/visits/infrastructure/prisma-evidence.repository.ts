import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { Evidence } from '../domain/entities/evidence.entity';
import { EvidenceRepository } from '../domain/repositories/evidence.repository';

@Injectable()
export class PrismaEvidenceRepository implements EvidenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(evidence: Evidence): Promise<Evidence & { id: string }> {
    // tenantId explícito para satisfazer o tipo do Prisma — o middleware de
    // tenant confirma/sobrescreve com o mesmo valor em runtime.
    const created = await this.prisma.evidence.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        clientGeneratedId: evidence.clientGeneratedId,
        visitId: evidence.visitId,
        type: evidence.type,
        storageKey: evidence.storageKey ?? undefined,
        mimeType: evidence.mimeType ?? undefined,
        sizeBytes: evidence.sizeBytes ?? undefined,
        note: evidence.note ?? undefined,
      },
    });
    return Object.assign(evidence, { id: created.id });
  }

  async findByVisitId(visitId: string): Promise<Array<Evidence & { id: string }>> {
    const rows = await this.prisma.evidence.findMany({ where: { visitId }, orderBy: { createdAt: 'asc' } });
    return rows.map((row) =>
      Object.assign(
        Evidence.register({
          clientGeneratedId: row.clientGeneratedId,
          visitId: row.visitId,
          type: row.type,
          storageKey: row.storageKey ?? undefined,
          mimeType: row.mimeType ?? undefined,
          sizeBytes: row.sizeBytes ?? undefined,
          note: row.note ?? undefined,
        }),
        { id: row.id },
      ),
    );
  }
}
