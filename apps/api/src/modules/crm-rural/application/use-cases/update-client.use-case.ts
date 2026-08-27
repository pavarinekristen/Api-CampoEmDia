import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository, UpdateClientPatch } from '../../domain/repositories/client.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';

export interface UpdateClientInput extends UpdateClientPatch {
  clientId: string;
  version?: number;
}

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: UpdateClientInput) {
    const existing = await this.clients.findById(input.clientId);
    if (!existing) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const { clientId, version, ...patch } = input;
    const result = await this.clients.update(clientId, patch, version);
    if (result === 'CONFLICT') {
      throw new ConflictException('O cliente foi alterado por outra sessão — recarregue e tente novamente.');
    }

    await this.auditLog.record({ entity: 'Client', entityId: result.id, action: 'UPDATE', diff: patch });
    return result;
  }
}
