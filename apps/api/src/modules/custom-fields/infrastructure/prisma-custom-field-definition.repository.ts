import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';
import { CustomFieldDefinition, CustomFieldEntityType } from '../domain/entities/custom-field-definition.entity';
import { CustomFieldDefinitionRepository } from '../domain/repositories/custom-field-definition.repository';

@Injectable()
export class PrismaCustomFieldDefinitionRepository implements CustomFieldDefinitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(definition: CustomFieldDefinition): Promise<CustomFieldDefinition & { id: string }> {
    // tenantId explícito para satisfazer o tipo do Prisma — o middleware de
    // tenant confirma/sobrescreve com o mesmo valor em runtime.
    const created = await this.prisma.customFieldDefinition.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        entityType: definition.entityType,
        key: definition.key,
        label: definition.label,
        fieldType: definition.fieldType,
        options: definition.options ?? undefined,
        required: definition.required,
        order: definition.order,
      },
    });
    return CustomFieldDefinition.fromPersistence(created);
  }

  async findById(id: string): Promise<(CustomFieldDefinition & { id: string }) | null> {
    const row = await this.prisma.customFieldDefinition.findUnique({ where: { id } });
    return row ? CustomFieldDefinition.fromPersistence(row) : null;
  }

  async findAllByEntityType(
    entityType: CustomFieldEntityType,
    onlyActive = true,
  ): Promise<Array<CustomFieldDefinition & { id: string }>> {
    const rows = await this.prisma.customFieldDefinition.findMany({
      where: { entityType, active: onlyActive ? true : undefined },
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => CustomFieldDefinition.fromPersistence(row));
  }

  async update(definition: CustomFieldDefinition & { id: string }): Promise<CustomFieldDefinition & { id: string }> {
    const updated = await this.prisma.customFieldDefinition.update({
      where: { id: definition.id },
      data: {
        label: definition.label,
        options: definition.options ?? undefined,
        required: definition.required,
        order: definition.order,
        active: definition.active,
      },
    });
    return CustomFieldDefinition.fromPersistence(updated);
  }

  async createManySkippingDuplicates(definitions: CustomFieldDefinition[]): Promise<number> {
    const tenantId = tenantContext.getOrThrow().tenantId;
    const result = await this.prisma.customFieldDefinition.createMany({
      data: definitions.map((d) => ({
        tenantId,
        entityType: d.entityType,
        key: d.key,
        label: d.label,
        fieldType: d.fieldType,
        options: d.options ?? undefined,
        required: d.required,
        order: d.order,
      })),
      skipDuplicates: true,
    });
    return result.count;
  }
}
