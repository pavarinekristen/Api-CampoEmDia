import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

/**
 * Adapter de object storage compatível com S3 (MinIO local / AWS S3 ou
 * R2/B2 em produção).
 *
 * Estratégia: uploads de mídia (fotos/áudio) NUNCA passam pelo processo da
 * API — o cliente sobe direto ao bucket usando uma URL pré-assinada, o que
 * poupa banda e memória do servidor (relevante em conexão rural limitada).
 * A API só grava metadados após a confirmação do upload.
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('STORAGE_BUCKET')!;
    this.client = new S3Client({
      endpoint: this.config.get<string>('STORAGE_ENDPOINT'),
      region: this.config.get<string>('STORAGE_REGION'),
      forcePathStyle: this.config.get<boolean>('STORAGE_FORCE_PATH_STYLE'),
      credentials: {
        accessKeyId: this.config.get<string>('STORAGE_ACCESS_KEY')!,
        secretAccessKey: this.config.get<string>('STORAGE_SECRET_KEY')!,
      },
    });
  }

  /**
   * Gera uma chave de objeto namespaced por tenant/entidade, evitando
   * colisão e permitindo revogação/limpeza em bloco por tenant.
   */
  buildKey(params: { tenantId: string; entity: 'visits' | 'reports'; entityId: string; filename: string }): string {
    const ext = params.filename.includes('.') ? params.filename.split('.').pop() : 'bin';
    return `${params.tenantId}/${params.entity}/${params.entityId}/${randomUUID()}.${ext}`;
  }

  async createUploadUrl(key: string, contentType: string, expiresInSeconds = 300): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async createDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
