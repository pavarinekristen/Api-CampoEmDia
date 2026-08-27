/**
 * Contratos compartilhados entre o backend (NestJS) e o PWA (React).
 *
 * Estes schemas Zod são a fonte única de verdade para o shape dos dados
 * trafegados na API — tanto o app quanto a API importam deste pacote,
 * eliminando divergência de contrato entre front e back.
 */
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// Enums compartilhados (espelham prisma/schema.prisma)
// ─────────────────────────────────────────────────────────────────────────

export const TenantTypeSchema = z.enum(['AUTONOMO', 'EMPRESA']);
export type TenantType = z.infer<typeof TenantTypeSchema>;

export const UserRoleSchema = z.enum([
  'PROFISSIONAL_PROPRIETARIO',
  'GESTOR_EQUIPE',
  'TECNICO_CAMPO',
  'SUPERVISOR_TECNICO',
  'CONSULTOR_PARCEIRO',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const VisitTypeSchema = z.enum([
  'ACOMPANHAMENTO',
  'EMERGENCIA',
  'RETORNO',
  'COLETA',
  'VACINACAO',
  'REPRODUCAO',
  'AVALIACAO_PRODUTIVA',
  'VISTORIA',
  'CONSULTORIA',
]);
export type VisitType = z.infer<typeof VisitTypeSchema>;

export const VisitStatusSchema = z.enum(['EM_ANDAMENTO', 'ENCERRADA', 'CANCELADA']);
export type VisitStatus = z.infer<typeof VisitStatusSchema>;

export const EvidenceTypeSchema = z.enum(['TEXTO', 'AUDIO', 'FOTO', 'VIDEO', 'DOCUMENTO']);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const TaskPrioritySchema = z.enum(['BAIXA', 'MEDIA', 'ALTA']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskStatusSchema = z.enum([
  'PENDENTE',
  'EM_ANDAMENTO',
  'CONCLUIDA',
  'ATRASADA',
  'CANCELADA',
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// ─────────────────────────────────────────────────────────────────────────
// CRM Rural
// ─────────────────────────────────────────────────────────────────────────

export const CreateClientSchema = z.object({
  name: z.string().min(2),
  contact: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateClientInput = z.infer<typeof CreateClientSchema>;

export const CreatePropertySchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(2),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  activities: z.string().optional(),
  frequency: z.string().optional(),
});
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;

// ─────────────────────────────────────────────────────────────────────────
// Visitas / Evidências / Tarefas
//
// Todo payload originado do app carrega `clientGeneratedId` (UUID gerado no
// dispositivo, offline-first) — é a chave de idempotência usada pelo motor
// de sincronização, independente do id atribuído pelo banco.
// ─────────────────────────────────────────────────────────────────────────

export const StartVisitSchema = z.object({
  clientGeneratedId: z.string().uuid(),
  propertyId: z.string().uuid(),
  type: VisitTypeSchema,
  startedAt: z.string().datetime(),
});
export type StartVisitInput = z.infer<typeof StartVisitSchema>;

export const AddEvidenceSchema = z.object({
  clientGeneratedId: z.string().uuid(),
  visitId: z.string().uuid(),
  type: EvidenceTypeSchema,
  storageKey: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  note: z.string().optional(),
});
export type AddEvidenceInput = z.infer<typeof AddEvidenceSchema>;

export const CreateTaskSchema = z.object({
  clientGeneratedId: z.string().uuid(),
  visitId: z.string().uuid(),
  description: z.string().min(2),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  priority: TaskPrioritySchema.default('MEDIA'),
  requiresReturnVisit: z.boolean().default(false),
  evidenceExpected: z.string().optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const EndVisitSchema = z.object({
  visitId: z.string().uuid(),
  endedAt: z.string().datetime(),
  summary: z.string().optional(),
});
export type EndVisitInput = z.infer<typeof EndVisitSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Sincronização offline — protocolo push/pull (ver docs/sync.md)
// ─────────────────────────────────────────────────────────────────────────

export const SyncOperationSchema = z.object({
  idempotencyKey: z.string().uuid(),
  deviceId: z.string(),
  entity: z.enum(['visit', 'evidence', 'task', 'property', 'client']),
  operation: z.enum(['CREATE', 'UPDATE']),
  clientTimestamp: z.string().datetime(),
  payload: z.record(z.unknown()),
});
export type SyncOperation = z.infer<typeof SyncOperationSchema>;

export const SyncPushRequestSchema = z.object({
  operations: z.array(SyncOperationSchema).min(1).max(200),
});
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;

export const SyncPushResultSchema = z.object({
  idempotencyKey: z.string().uuid(),
  status: z.enum(['APPLIED', 'DUPLICATE', 'CONFLICT', 'REJECTED']),
  serverEntityId: z.string().uuid().optional(),
  reason: z.string().optional(),
});
export type SyncPushResult = z.infer<typeof SyncPushResultSchema>;

export const SyncPullQuerySchema = z.object({
  cursor: z.string().optional(), // omitido = sincronização inicial completa
  limit: z.number().int().positive().max(500).default(200),
});
export type SyncPullQuery = z.infer<typeof SyncPullQuerySchema>;
