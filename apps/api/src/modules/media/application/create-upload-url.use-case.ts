import { Injectable } from '@nestjs/common';
import { StorageService } from '../../../infra/storage/storage.service';
import { tenantContext } from '../../../common/context/tenant-context';

export interface CreateUploadUrlInput {
  visitId: string;
  filename: string;
  contentType: string;
}

/**
 * Passo 1 do fluxo de upload direto ao object storage: a API nunca recebe
 * o binário — apenas gera a URL pré-assinada. O dispositivo sobe o
 * arquivo direto ao bucket e só então confirma via
 * `POST /visits/:visitId/evidences` (módulo `visits`), que grava a
 * `storageKey` retornada aqui.
 */
@Injectable()
export class CreateUploadUrlUseCase {
  constructor(private readonly storage: StorageService) {}

  async execute(input: CreateUploadUrlInput) {
    const { tenantId } = tenantContext.getOrThrow();
    const key = this.storage.buildKey({
      tenantId,
      entity: 'visits',
      entityId: input.visitId,
      filename: input.filename,
    });
    const uploadUrl = await this.storage.createUploadUrl(key, input.contentType);
    return { storageKey: key, uploadUrl };
  }
}
