import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { tenantContext } from '../../../common/context/tenant-context';

export interface CreateChargeInput {
  clientId: string;
  description: string;
  amountCents: number;
  dueDate?: Date;
}

/**
 * Cobrança simples por serviço (MVP item 11) — deliberadamente sem
 * conciliação bancária, boleto/PIX automático ou nota fiscal. Isso é
 * escopo explícito de fora do MVP (ver plano arquitetural: "ERP
 * financeiro e contábil completo" está fora da primeira versão).
 */
@Injectable()
export class CreateChargeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateChargeInput) {
    // tenantId é passado explicitamente aqui para satisfazer o tipo gerado
    // pelo Prisma (UncheckedCreateInput exige o campo) — o middleware de
    // tenant do PrismaService também o injeta/sobrescreve em runtime com o
    // mesmo valor, então isto nunca diverge do contexto autenticado.
    return this.prisma.serviceCharge.create({
      data: {
        tenantId: tenantContext.getOrThrow().tenantId,
        clientId: input.clientId,
        description: input.description,
        amountCents: input.amountCents,
        dueDate: input.dueDate,
      },
    });
  }
}
