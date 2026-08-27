import { z } from 'zod';

/**
 * Validação de ambiente na inicialização — falha rápido (fail-fast) se uma
 * variável obrigatória estiver ausente, em vez de falhar silenciosamente
 * em runtime dentro de um caso de uso.
 */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),

  STORAGE_ENDPOINT: z.string().default('http://localhost:9000'),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_BUCKET: z.string().default('campo-em-dia'),
  STORAGE_ACCESS_KEY: z.string().default('campo_em_dia'),
  STORAGE_SECRET_KEY: z.string().default('campo_em_dia_secret'),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean().default(true), // necessário para MinIO
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
    throw new Error('Configuração de ambiente inválida — veja os detalhes acima.');
  }
  return parsed.data;
}
