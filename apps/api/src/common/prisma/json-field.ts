import { Prisma } from '@prisma/client';

/**
 * Converte um valor de campo customizado (ou qualquer coluna `Json?`) para
 * o shape que o Prisma espera:
 *  - `undefined` → não toca a coluna (usado em update parcial);
 *  - `null` → limpa a coluna (SQL NULL);
 *  - objeto → grava como está.
 *
 * Evita repetir este cast em cada repositório que tem uma coluna `Json?`
 * (Client, Property, Visit, Animal, AnimalHealthEvent).
 */
export function toNullableJsonInput(
  value: Record<string, unknown> | null | undefined,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}
