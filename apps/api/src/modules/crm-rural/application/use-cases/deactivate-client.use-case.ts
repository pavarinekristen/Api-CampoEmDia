import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/repositories/client.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

@Injectable()
export class DeactivateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(id: string) {
    const existing = await this.clients.findById(id);
    if (!existing) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    await this.clients.softDelete(id);
    await this.auditLog.record({ entity: 'Client', entityId: id, action: 'DEACTIVATE' });
  }
}
