import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository, UpdateClientPatch } from '../../domain/repositories/client.repository';
import { AuditLogService } from '../../../../infra/audit/audit-log.service';
import { CustomFieldsValidatorService } from '../../../custom-fields/application/custom-fields-validator.service';

export interface UpdateClientInput extends UpdateClientPatch {
  clientId: string;
  version?: number;
}

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clients: ClientRepository,
    private readonly auditLog: AuditLogService,
    private readonly customFieldsValidator: CustomFieldsValidatorService,
  ) {}

  async execute(input: UpdateClientInput) {
    const existing = await this.clients.findById(input.clientId);
    if (!existing) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const { clientId, version, ...patch } = input;
    // customFields só é validado quando explicitamente enviado — `undefined`
    // significa "não mexer nesse campo", e não "limpar tudo e reprovar por
    // campo obrigatório ausente".
    if (patch.customFields !== undefined) {
      patch.customFields = await this.customFieldsValidator.validate('CLIENT', patch.customFields);
    }
    const result = await this.clients.update(clientId, patch, version);
    if (result === 'CONFLICT') {
      throw new ConflictException('O cliente foi alterado por outra sessão — recarregue e tente novamente.');
    }

    await this.auditLog.record({ entity: 'Client', entityId: result.id, action: 'UPDATE', diff: patch });
    return result;
  }
}
