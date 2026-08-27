import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class GetChargeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const charge = await this.prisma.serviceCharge.findUnique({ where: { id } });
    if (!charge) {
      throw new NotFoundException('Cobrança não encontrada.');
    }
    return charge;
  }
}
