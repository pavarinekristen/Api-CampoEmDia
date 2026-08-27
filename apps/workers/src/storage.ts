import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

const client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT ?? 'http://localhost:9000',
  region: process.env.STORAGE_REGION ?? 'us-east-1',
  forcePathStyle: (process.env.STORAGE_FORCE_PATH_STYLE ?? 'true') === 'true',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY ?? 'campo_em_dia',
    secretAccessKey: process.env.STORAGE_SECRET_KEY ?? 'campo_em_dia_secret',
  },
});

const bucket = process.env.STORAGE_BUCKET ?? 'campo-em-dia';

export async function uploadReportPdf(tenantId: string, visitId: string, buffer: Buffer): Promise<string> {
  const key = `${tenantId}/reports/${visitId}/${randomUUID()}.pdf`;
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: 'application/pdf' }),
  );
  return key;
}
